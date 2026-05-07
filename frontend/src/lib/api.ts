// In development, Next.js rewrites proxy /api/* to the backend.
// In production, set NEXT_PUBLIC_API_URL to the deployed backend origin.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface CropImageResponse {
  success: boolean;
  cropped_image: string;
  confidence: number;
  message: string;
  original_size: [number, number];
  cropped_size: [number, number];
  crop_box?: [number, number, number, number];
  detection_method?: "contour" | "center_fallback" | "failed";
}

export interface ApiError {
  detail: string;
}

export async function cropImage(file: File): Promise<CropImageResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/crop-image`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: `Server error (${response.status})`,
    }));
    throw new Error(error.detail || `Request failed with status ${response.status}`);
  }

  const data: CropImageResponse = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Image processing failed");
  }

  return data;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
