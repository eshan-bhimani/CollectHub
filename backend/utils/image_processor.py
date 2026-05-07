import cv2
import numpy as np
import base64
from typing import Dict, Tuple, Optional, List
import logging
from io import BytesIO
from PIL import Image

logger = logging.getLogger(__name__)


class CardCropper:
    """Handles detection and cropping of baseball cards from images."""

    # Standard baseball card aspect ratio (2.5" x 3.5" = 0.714)
    CARD_ASPECT_RATIO = 2.5 / 3.5
    ASPECT_RATIO_TOLERANCE = 0.30  # Allow variance for different card types

    # Minimum card area (percentage of image)
    MIN_CARD_AREA_RATIO = 0.01  # Card should be at least 1% of image
    MAX_CARD_AREA_RATIO = 1.00  # Allow cards that fill the frame

    # Edge padding percentage (expand detected region to keep card/case edges visible)
    # A small outset ensures the full case edges are in frame with minimal background
    EDGE_PADDING_PERCENT = 0.015  # 1.5% padding beyond detected edge
    SCREENSHOT_PADDING_PERCENT = 0.02  # 2% padding for screenshots (detection tends to be tighter)

    def __init__(self):
        """Initialize the card cropper."""
        logger.info("CardCropper initialized with edge-preserving detection (case edges kept visible)")

    def crop_card(self, image_bytes: bytes) -> Dict:
        """
        Detect and crop a baseball card from an image.
        Preserves the full card case edges with minimal surrounding background.

        Args:
            image_bytes: Raw image bytes

        Returns:
            Dictionary containing:
            - success: bool
            - cropped_image: base64 encoded image (if successful)
            - confidence: float (0-1)
            - message: str
            - original_size: tuple (width, height)
            - cropped_size: tuple (width, height)
        """
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if image is None:
                return {
                    "success": False,
                    "message": "Failed to decode image",
                    "error": "Invalid image format"
                }

            original_h, original_w = image.shape[:2]
            logger.info(f"Processing image of size {original_w}x{original_h}")

            # Detect card with improved algorithm (returns bounding box, not contour)
            card_bbox, confidence, is_screenshot, detection_method = self._detect_card_contour_advanced(image)

            if card_bbox is None:
                card_bbox, confidence, detection_method = self._fallback_center_crop_bbox(image)
                if card_bbox is None:
                    return {
                        "success": False,
                        "message": "No card detected in image. Please ensure the card is clearly visible.",
                        "confidence": 0.0,
                        "original_size": [original_w, original_h],
                        "detection_method": "failed"
                    }

            # Extract card using axis-aligned bounding box (no perspective distortion)
            # Apply edge padding to keep card/case edges visible with minimal background
            cropped_card = self._extract_card_bbox(image, card_bbox, is_screenshot=is_screenshot)

            if cropped_card is None:
                return {
                    "success": False,
                    "message": "Failed to extract card from image",
                    "confidence": confidence,
                    "original_size": [original_w, original_h]
                }

            # Convert to base64
            cropped_base64 = self._image_to_base64(cropped_card)

            cropped_h, cropped_w = cropped_card.shape[:2]

            return {
                "success": True,
                "cropped_image": cropped_base64,
                "confidence": confidence,
                "message": "Card successfully detected and cropped",
                "original_size": [original_w, original_h],
                "cropped_size": [cropped_w, cropped_h],
                "crop_box": card_bbox,
                "detection_method": detection_method
            }

        except Exception as e:
            logger.error(f"Error in crop_card: {str(e)}", exc_info=True)
            return {
                "success": False,
                "message": f"Error processing image: {str(e)}",
                "error": str(e)
            }

    def _detect_card_contour_advanced(self, image: np.ndarray) -> Tuple[Optional[List[int]], float, bool, str]:
        """
        Detect the card or PSA slab in the image.
        For PSA cases: detects the FULL slab (label + holder + card).
        For raw cards: detects just the card.
        Uses axis-aligned bounding box to avoid perspective distortion.

        Args:
            image: Input image (BGR format)

        Returns:
            Tuple of (bounding_box as [x, y, w, h], confidence_score, is_screenshot, detection_method)
        """
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

        height, width = image.shape[:2]
        image_area = height * width
        mean_brightness = np.mean(gray)

        # Check if this looks like a screenshot (has UI elements at top)
        is_screenshot = self._detect_screenshot_ui(image)
        logger.info(f"Screenshot detection: {is_screenshot}")

        # Check for wood/desk background (brown tones)
        has_wood_background = self._detect_wood_background(hsv)
        logger.info(f"Wood background detection: {has_wood_background}")

        # Determine detection strategy based on background and image type
        is_dark_background = mean_brightness < 100

        # Detection strategy based on background type
        if has_wood_background:
            # Wood/desk background: mask out brown tones and find card
            logger.info("Using wood background detection strategy")
            combined = self._detect_card_on_wood(image, gray, hsv)
        elif is_dark_background:
            # Dark background (typical PSA photo): threshold to find bright objects
            _, thresh = cv2.threshold(gray, 40, 255, cv2.THRESH_BINARY)
            edges = cv2.Canny(gray, 50, 150)
            combined = cv2.bitwise_or(thresh, edges)
        else:
            # Light background: use edge detection with adaptive approach
            # Adaptive thresholding handles local variations better
            adaptive_thresh = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY_INV, 11, 2
            )

            # Standard edge detection
            edges = cv2.Canny(gray, 30, 100)

            # Look for shadows (often darker areas around card edges)
            _, shadow_thresh = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY_INV)

            combined = cv2.bitwise_or(edges, shadow_thresh)
            combined = cv2.bitwise_or(combined, adaptive_thresh)

        # Clean up the mask
        kernel = np.ones((5, 5), np.uint8)
        combined = cv2.morphologyEx(combined, cv2.MORPH_CLOSE, kernel, iterations=2)
        combined = cv2.morphologyEx(combined, cv2.MORPH_OPEN, kernel, iterations=1)

        # Find contours
        contours, hierarchy = cv2.findContours(
            combined,
            cv2.RETR_EXTERNAL,  # Only outermost contours (the full slab, not inner card)
            cv2.CHAIN_APPROX_SIMPLE
        )

        if not contours:
            logger.warning("No contours found in image")
            return None, 0.0, is_screenshot, "failed"

        candidates = []

        for contour in contours:
            area = cv2.contourArea(contour)
            area_ratio = area / image_area

            # Skip contours that are too small or too large
            if area_ratio < self.MIN_CARD_AREA_RATIO or area_ratio > 0.98:
                continue

            # Get axis-aligned bounding rectangle (no rotation = no distortion)
            x, y, w, h = cv2.boundingRect(contour)

            # Calculate aspect ratio
            aspect_ratio = min(w, h) / max(w, h) if max(w, h) > 0 else 0
            aspect_diff = abs(aspect_ratio - self.CARD_ASPECT_RATIO)

            # Skip if aspect ratio is way off (allow more tolerance for PSA slabs)
            if aspect_diff > self.ASPECT_RATIO_TOLERANCE:
                continue

            # Approximate contour to check if rectangular
            peri = cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, 0.02 * peri, True)

            if not (4 <= len(approx) <= 12):
                continue

            # Calculate solidity
            hull = cv2.convexHull(contour)
            hull_area = cv2.contourArea(hull)
            solidity = area / hull_area if hull_area > 0 else 0

            # Calculate confidence
            confidence = self._calculate_confidence_advanced(
                area_ratio=area_ratio,
                aspect_ratio=aspect_ratio,
                num_vertices=len(approx),
                solidity=solidity,
                has_parent=False
            )

            candidates.append({
                "bbox": [x, y, w, h],
                "confidence": confidence,
                "area_ratio": area_ratio,
                "aspect_ratio": aspect_ratio,
                "solidity": solidity
            })

        if not candidates:
            logger.warning("No valid card candidates found")
            return None, 0.0, is_screenshot, "failed"

        # Select the best candidate by confidence
        best_candidate = max(candidates, key=lambda x: x["confidence"])

        logger.info(
            f"Best match: confidence={best_candidate['confidence']:.3f}, "
            f"aspect_ratio={best_candidate['aspect_ratio']:.3f}, "
            f"area_ratio={best_candidate['area_ratio']:.3f}"
        )

        return best_candidate["bbox"], best_candidate["confidence"], is_screenshot, "contour"

    def _fallback_center_crop_bbox(self, image: np.ndarray) -> Tuple[Optional[List[int]], float, str]:
        """
        Produce a conservative centered portrait crop when contour detection misses.
        This keeps the tool useful for clean, centered phone shots where glare or a
        low-contrast background hides the card edges from OpenCV.
        """
        height, width = image.shape[:2]

        if min(width, height) < 120:
            logger.warning("Image too small for fallback crop: %sx%s", width, height)
            return None, 0.0, "failed"

        target_ratio = self.CARD_ASPECT_RATIO
        usable_w = width * 0.88
        usable_h = height * 0.88

        crop_h = usable_h
        crop_w = crop_h * target_ratio

        if crop_w > usable_w:
            crop_w = usable_w
            crop_h = crop_w / target_ratio

        x = int((width - crop_w) / 2)
        y = int((height - crop_h) / 2)
        w = int(crop_w)
        h = int(crop_h)

        if w <= 0 or h <= 0:
            return None, 0.0, "failed"

        logger.info("Using fallback centered crop: x=%s y=%s w=%s h=%s", x, y, w, h)
        return [x, y, w, h], 0.35, "center_fallback"

    def _detect_screenshot_ui(self, image: np.ndarray) -> bool:
        """
        Detect if the image appears to be a screenshot from a phone/app.
        Looks for common UI patterns like status bars at the top.

        Args:
            image: Input image (BGR format)

        Returns:
            True if screenshot UI elements are detected
        """
        height, width = image.shape[:2]
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Check top portion for status bar (usually dark or has specific patterns)
        top_strip_height = int(height * 0.05)  # Top 5%
        top_strip = gray[:top_strip_height, :]

        # Status bars often have consistent brightness across the strip
        top_std = np.std(top_strip)
        top_mean = np.mean(top_strip)

        # Check for "X" button or close icon in top-left area (common in apps)
        top_left = gray[:int(height * 0.08), :int(width * 0.15)]
        top_left_edges = cv2.Canny(top_left, 50, 150)
        edge_density = np.sum(top_left_edges > 0) / top_left_edges.size

        # Check for page indicators like "1 of 2" (centered text in top area)
        top_center = gray[:int(height * 0.08), int(width * 0.3):int(width * 0.7)]
        top_center_std = np.std(top_center)

        # Screenshot indicators:
        # 1. Low variation in status bar area (solid color)
        # 2. Edge patterns suggesting UI buttons
        # 3. High variation suggesting text/icons
        is_screenshot = (
            (top_std < 40 and top_mean > 20) or  # Solid status bar
            (edge_density > 0.02) or  # UI button detected
            (top_center_std > 30)  # Text in center top
        )

        return is_screenshot

    def _detect_content_area(self, image: np.ndarray, gray: np.ndarray) -> np.ndarray:
        """
        For screenshots, detect the main content display area where the card is shown.
        This helps exclude UI elements from detection.

        Args:
            image: Input image (BGR format)
            gray: Grayscale version

        Returns:
            Binary mask highlighting potential card boundaries
        """
        height, width = image.shape[:2]

        # Look for rectangular content area by finding strong horizontal/vertical edges
        # Use Sobel to find directional edges
        sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)

        # Find strong edges
        abs_sobel_x = np.uint8(np.absolute(sobel_x))
        abs_sobel_y = np.uint8(np.absolute(sobel_y))

        # Threshold to get strong edges
        _, thresh_x = cv2.threshold(abs_sobel_x, 30, 255, cv2.THRESH_BINARY)
        _, thresh_y = cv2.threshold(abs_sobel_y, 30, 255, cv2.THRESH_BINARY)

        # Combine horizontal and vertical edges
        combined = cv2.bitwise_or(thresh_x, thresh_y)

        # Use morphology to connect edges
        kernel_h = np.ones((1, 15), np.uint8)
        kernel_v = np.ones((15, 1), np.uint8)

        dilated_h = cv2.dilate(thresh_x, kernel_h, iterations=1)
        dilated_v = cv2.dilate(thresh_y, kernel_v, iterations=1)

        combined = cv2.bitwise_or(dilated_h, dilated_v)

        return combined

    def _detect_wood_background(self, hsv: np.ndarray) -> bool:
        """
        Detect if the image has a significant wood/desk background.
        Wood typically has brown tones (orange-brown hue, medium saturation).

        Args:
            hsv: Image in HSV color space

        Returns:
            True if wood background is detected
        """
        # Brown/wood colors in HSV
        # Hue: 10-30 (orange-brown range)
        # Saturation: 30-200 (noticeable but not super saturated)
        # Value: 30-180 (medium brightness, not too dark or bright)
        wood_mask = cv2.inRange(hsv, np.array([10, 30, 30]), np.array([30, 200, 180]))

        # Calculate percentage of image that is wood-colored
        wood_ratio = np.sum(wood_mask > 0) / wood_mask.size

        logger.info(f"Wood color ratio: {wood_ratio:.2%}")

        # If more than 15% of image is wood-colored, consider it a wood background
        return wood_ratio > 0.15

    def _detect_card_on_wood(self, image: np.ndarray, gray: np.ndarray, hsv: np.ndarray) -> np.ndarray:
        """
        Detect card boundaries when card is on a wood/desk surface.
        Uses color filtering to exclude wood and find the card.

        Args:
            image: Input image (BGR format)
            gray: Grayscale version
            hsv: HSV version

        Returns:
            Binary mask for contour detection
        """
        # Create mask for wood/brown areas to EXCLUDE
        wood_mask = cv2.inRange(hsv, np.array([8, 25, 25]), np.array([35, 200, 180]))

        # Slightly expand wood mask
        kernel_expand = np.ones((5, 5), np.uint8)
        wood_mask = cv2.dilate(wood_mask, kernel_expand, iterations=1)

        # Invert to get non-wood areas (potential card regions)
        non_wood_mask = cv2.bitwise_not(wood_mask)

        # Edge detection
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)

        # Also look for the plastic case - it's usually lighter/reflective
        # Detect high brightness areas (plastic case reflection)
        _, bright_mask = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY)

        # Detect blue/gray tones (the card itself has blue elements)
        blue_mask = cv2.inRange(hsv, np.array([90, 20, 30]), np.array([130, 255, 200]))

        # Combine: non-wood edges + bright areas + blue card areas
        combined = cv2.bitwise_or(edges, bright_mask)
        combined = cv2.bitwise_or(combined, blue_mask)

        # Apply non-wood mask
        combined = cv2.bitwise_and(combined, non_wood_mask)

        # Clean up
        kernel = np.ones((7, 7), np.uint8)
        combined = cv2.morphologyEx(combined, cv2.MORPH_CLOSE, kernel, iterations=3)
        combined = cv2.morphologyEx(combined, cv2.MORPH_OPEN, kernel, iterations=1)

        return combined

    def _calculate_confidence_advanced(
        self,
        area_ratio: float,
        aspect_ratio: float,
        num_vertices: int,
        solidity: float,
        has_parent: bool
    ) -> float:
        """
        Advanced confidence scoring optimized for PSA cases.

        Args:
            area_ratio: Ratio of contour area to image area
            aspect_ratio: Aspect ratio of bounding rectangle (normalized)
            num_vertices: Number of vertices in approximated polygon
            solidity: How filled the contour is (area/convex_hull_area)
            has_parent: Whether this contour is nested inside another

        Returns:
            Confidence score between 0 and 1
        """
        confidence = 0.0

        # Aspect ratio match (40% weight) - important but allow for variance
        # PSA cases may have slightly different aspect ratios
        aspect_diff = abs(aspect_ratio - self.CARD_ASPECT_RATIO)
        if aspect_diff < 0.08:
            aspect_score = 1.0
        elif aspect_diff < 0.15:
            aspect_score = 0.95
        elif aspect_diff < 0.20:
            aspect_score = 0.85
        elif aspect_diff < self.ASPECT_RATIO_TOLERANCE:
            aspect_score = 0.75
        else:
            aspect_score = 0.5
        confidence += aspect_score * 0.40

        # Area ratio (30% weight) - flexible for different scenarios
        # PSA cases: 40-70%, raw cards on tables: 5-40%, close-ups: 70-100%
        if 0.40 <= area_ratio <= 0.70:
            # Ideal range for PSA cases
            area_score = 1.0
        elif 0.70 < area_ratio <= 0.95:
            # Close-up shots or cards filling frame
            area_score = 0.98
        elif 0.30 <= area_ratio < 0.40:
            # Smaller cards or wider shots
            area_score = 0.95
        elif 0.15 <= area_ratio < 0.30:
            # Raw cards on tables
            area_score = 0.90
        elif 0.05 <= area_ratio < 0.15:
            # Small cards in larger scenes
            area_score = 0.85
        else:
            # Very small or very large
            area_score = 0.75
        confidence += area_score * 0.30

        # Vertex count (20% weight) - prefer clean 4-corner rectangles
        if num_vertices == 4:
            vertex_score = 1.0
        elif num_vertices == 5:
            vertex_score = 0.95
        elif num_vertices == 6:
            vertex_score = 0.85
        elif num_vertices == 7:
            vertex_score = 0.75
        else:
            vertex_score = 0.65
        confidence += vertex_score * 0.20

        # Solidity (10% weight) - prefer solid rectangular shapes
        if solidity > 0.95:
            solidity_score = 1.0
        elif solidity > 0.90:
            solidity_score = 0.95
        elif solidity > 0.85:
            solidity_score = 0.90
        else:
            solidity_score = max(0.70, solidity)
        confidence += solidity_score * 0.10

        return min(1.0, confidence)

    def _extract_card_bbox(self, image: np.ndarray, bbox: List[int], is_screenshot: bool = False) -> Optional[np.ndarray]:
        """
        Extract card using axis-aligned bounding box (no perspective distortion).
        Applies a small outset padding beyond the detected edge so the full card/case
        edges remain visible with minimal surrounding background.
        Auto-rotates sideways cards to upright (portrait) orientation.

        Args:
            image: Original image
            bbox: Bounding box as [x, y, w, h]
            is_screenshot: Whether this is a screenshot (uses slightly larger padding)

        Returns:
            Cropped card image (rotated to upright if needed)
        """
        x, y, w, h = bbox
        img_h, img_w = image.shape[:2]

        # Use outset padding to ensure card/case edges are fully visible
        if is_screenshot:
            padding_pct = self.SCREENSHOT_PADDING_PERCENT
            logger.info(f"Screenshot mode: applying {padding_pct:.1%} edge padding")
        else:
            padding_pct = self.EDGE_PADDING_PERCENT
            logger.info(f"Standard mode: applying {padding_pct:.1%} edge padding")

        pad_x = int(w * padding_pct)
        pad_y = int(h * padding_pct)

        # Expand outward from detected boundary (clamp to image edges)
        x1 = max(0, x - pad_x)
        y1 = max(0, y - pad_y)
        x2 = min(img_w, x + w + pad_x)
        y2 = min(img_h, y + h + pad_y)

        # Ensure we have a valid region
        if x2 <= x1 or y2 <= y1:
            logger.warning("Invalid crop region after padding, using original bbox")
            x1 = max(0, x)
            y1 = max(0, y)
            x2 = min(img_w, x + w)
            y2 = min(img_h, y + h)

        # Validate the region is usable
        if x2 <= x1 or y2 <= y1:
            logger.error("Cannot produce a valid crop region")
            return None

        # Crop the card
        cropped = image[y1:y2, x1:x2]
        crop_h, crop_w = cropped.shape[:2]

        if crop_h == 0 or crop_w == 0:
            logger.error(f"Crop produced degenerate image: {crop_w}x{crop_h}")
            return None

        logger.info(f"Cropped from ({x1},{y1}) to ({x2},{y2}), size: {crop_w}x{crop_h}")

        # Auto-rotate if image is sideways (landscape when it should be portrait)
        # Standard cards should be portrait (height > width)
        if crop_w > crop_h and min(crop_w, crop_h) >= 10:
            logger.info(f"Detected sideways orientation ({crop_w}x{crop_h}), rotating to upright")
            cropped = self._rotate_to_upright(cropped)

        return cropped

    def _rotate_to_upright(self, image: np.ndarray) -> np.ndarray:
        """
        Rotate a sideways card image to upright (portrait) orientation.
        Detects PSA label position - handles both types:
        1. White background with RED border (modern PSA)
        2. Fully DARK BLUE label (older PSA)
        The PSA label should be at the TOP of the final image.

        Args:
            image: Cropped card image in landscape orientation

        Returns:
            Rotated image in portrait orientation
        """
        h, w = image.shape[:2]

        # Check narrow strips at left and right edges for PSA label
        # The PSA label is a concentrated bar at one end
        strip_width = max(1, int(w * 0.12))  # Look at the outer 12% on each side, minimum 1px
        left_strip = image[:, :strip_width]
        right_strip = image[:, w - strip_width:]

        # Convert to HSV for color detection
        left_hsv = cv2.cvtColor(left_strip, cv2.COLOR_BGR2HSV)
        right_hsv = cv2.cvtColor(right_strip, cv2.COLOR_BGR2HSV)

        # TYPE 1: Red-bordered PSA label (white background + red border)
        # Red in HSV: Hue 0-10 or 160-180, high saturation
        red_mask_left = cv2.inRange(left_hsv, np.array([0, 120, 100]), np.array([10, 255, 255])) + \
                        cv2.inRange(left_hsv, np.array([160, 120, 100]), np.array([180, 255, 255]))
        red_mask_right = cv2.inRange(right_hsv, np.array([0, 120, 100]), np.array([10, 255, 255])) + \
                         cv2.inRange(right_hsv, np.array([160, 120, 100]), np.array([180, 255, 255]))

        left_red = np.sum(red_mask_left > 0)
        right_red = np.sum(red_mask_right > 0)

        # TYPE 2: Dark blue PSA label (fully navy/dark blue)
        # Navy blue in HSV: Hue 105-125 (narrower to avoid green/teal)
        # Lower value range to catch dark navy (30-150)
        blue_mask_left = cv2.inRange(left_hsv, np.array([105, 70, 30]), np.array([125, 255, 150]))
        blue_mask_right = cv2.inRange(right_hsv, np.array([105, 70, 30]), np.array([125, 255, 150]))

        left_blue = np.sum(blue_mask_left > 0)
        right_blue = np.sum(blue_mask_right > 0)

        # Calculate scores - PSA label side should have significant red OR blue
        # The red/blue should be concentrated (part of the label bar)
        left_psa_score = max(left_red, left_blue * 1.5)  # Weight blue slightly higher
        right_psa_score = max(right_red, right_blue * 1.5)

        logger.info(f"PSA detection - Left: red={left_red}, blue={left_blue}, score={left_psa_score:.0f}")
        logger.info(f"PSA detection - Right: red={right_red}, blue={right_blue}, score={right_psa_score:.0f}")

        # Determine rotation direction based on where the PSA label is
        # PSA label should end up at the TOP after rotation
        # CLOCKWISE: left -> top, COUNTERCLOCKWISE: right -> top
        if right_psa_score > left_psa_score:
            # PSA label is on right, rotate counter-clockwise to put it at top
            logger.info("PSA label detected on right, rotating 90° counter-clockwise")
            rotated = cv2.rotate(image, cv2.ROTATE_90_COUNTERCLOCKWISE)
        else:
            # PSA label is on left, rotate clockwise to put it at top
            logger.info("PSA label detected on left, rotating 90° clockwise")
            rotated = cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE)

        return rotated

    def _image_to_base64(self, image: np.ndarray) -> str:
        """
        Convert OpenCV image to base64 string with lossless PNG compression.

        Args:
            image: OpenCV image (BGR format)

        Returns:
            Base64 encoded image string
        """
        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Convert to PIL Image
        pil_image = Image.fromarray(image_rgb)

        # Save to bytes buffer as PNG (lossless compression)
        # PNG preserves 100% quality while still compressing the file
        buffer = BytesIO()
        pil_image.save(buffer, format="PNG", compress_level=6)  # Level 6 = good compression, fast
        buffer.seek(0)

        # Encode to base64
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

        return f"data:image/png;base64,{image_base64}"
