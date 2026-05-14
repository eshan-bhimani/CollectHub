# Baseball Card Auto-Cropping & Upload Tool

**MVP: Automated card cropping from photos with Google Photos integration**

A mobile-first solution that eliminates the manual work of cropping hundreds of baseball card photos. Built to solve the real pain point of sports card collectors who spend hours preparing images for PSA Registry and other platforms.

---

## 🎯 Problem Statement

Sports card collectors face a tedious workflow when digitizing their collections:

- **Manual cropping** of hundreds of card photos takes hours
- **Inconsistent results** from hand-cropping on mobile devices
- **3-week lag** for professional card scans from services like Fanatics
- **Repetitive uploads** across multiple platforms (PSA Registry, eBay, etc.)

This tool automates the image processing pipeline, reducing hours of manual work to minutes.

---

## 🏗️ MVP Architecture

**Frontend:** React Native with Expo — True mobile app for camera integration
**Backend:** Python FastAPI (Render) — RESTful API for image processing
**Computer Vision:** OpenCV — Automated card detection & perspective correction
**Integration:** Google Photos API — OAuth-based upload with metadata  

---

## 🚀 MVP Features

### Phase 1: Image Processing Backend ✅ COMPLETED
- ✅ **Automatic Card Detection** — OpenCV-based contour detection with confidence scoring
- ✅ **Perspective Correction** — Handles rotated cards, straightens automatically
- ✅ **REST API** — `/api/crop-image` endpoint with comprehensive error handling
- ✅ **Render Deployment** — Production-ready with health checks and monitoring

### Phase 2: Google Photos Integration (In Progress)
- ⏳ **OAuth 2.0 Flow** — Secure Google account connection
- ⏳ **Photo Upload** — Automated upload with metadata (card name, year, set)
- ⏳ **Album Management** — Auto-create and organize albums

### Phase 3: React Native Mobile App (Planned)
- 📱 **Camera Integration** — Take photos directly in-app
- 📱 **Preview & Review** — See cropped result before uploading
- 📱 **Batch Processing** — Process multiple cards efficiently
- 📱 **Metadata Entry** — Optional fields for card details

---

## 🛠️ Tech Stack

- **Backend:** Python 3.11, FastAPI, Uvicorn
- **Computer Vision:** OpenCV, Pillow, NumPy
- **Mobile:** React Native, Expo (camera, auth, image-picker)
- **Cloud:** Render (backend hosting), Google Cloud Platform (Photos API)
- **Authentication:** OAuth 2.0, Google Auth Libraries

---

## 📊 Project Status

**Phase 1 Complete (Backend API)** ✅
- Fully functional card detection & cropping API
- Deployed to Render with health monitoring
- Comprehensive documentation and testing tools
- [Backend Documentation](backend/README.md)

**Phase 2 In Progress (Google Integration)** ⏳
- OAuth flow implementation
- Google Photos API integration
- Upload with metadata support

**Phase 3 Planned (Mobile App)** 📱
- React Native app development
- Camera & gallery integration
- End-to-end user flow

## 🚀 Quick Start

### Backend API

```bash
cd backend

# Set up environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Install Playwright browser (required for PSA Registry sync)
playwright install chromium

# Run server
python app.py
```

Server runs at http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### Test the API

```bash
# Using test script
python test_api.py test_images/your_card.jpg

# Or using curl
curl -X POST "http://localhost:8000/api/crop-image" \
  -F "file=@your_card.jpg"
```

See [Backend README](backend/README.md) for detailed setup and deployment instructions.

## 📁 Project Structure

```
Sports-Card-Trading/
├── backend/                    # Python FastAPI backend
│   ├── app.py                 # Main application
│   ├── config.py              # Configuration settings
│   ├── requirements.txt       # Python dependencies
│   ├── render.yaml            # Render deployment config
│   ├── test_api.py            # Test script
│   ├── utils/
│   │   └── image_processor.py # OpenCV card detection logic
│   ├── test_images/           # Test images directory
│   ├── README.md              # Backend documentation
│   └── RENDER_DEPLOYMENT.md   # Deployment guide
├── mobile/                     # React Native app (Phase 3)
│   └── (coming soon)
└── README.md                   # This file
```

## 🔬 How It Works

### Card Detection Algorithm

1. **Preprocessing**
   - Convert to grayscale
   - Gaussian blur for noise reduction
   - Adaptive thresholding + Canny edge detection

2. **Contour Analysis**
   - Find external contours in image
   - Filter by size (min 5% of image area)
   - Filter by shape (4-6 vertices for rectangles)

3. **Confidence Scoring**
   - Aspect ratio matching (standard card: 2.5:3.5)
   - Area validation (not too small/large)
   - Vertex count (prefer clean rectangles)

4. **Perspective Transform**
   - Four-point perspective correction
   - Automatic rotation to portrait
   - Output straightened, cropped card

### API Response Example

```json
{
  "success": true,
  "cropped_image": "data:image/jpeg;base64,...",
  "confidence": 0.87,
  "message": "Card successfully detected and cropped",
  "original_size": [1920, 1080],
  "cropped_size": [500, 700]
}
```

## 🎯 Future Enhancements (Post-MVP)

- **Batch Processing** — Process multiple cards in one session
- **Card Recognition** — ML-based card identification
- **OCR Metadata** — Auto-extract player name, year, set
- **PSA Registry Integration** — Direct upload to PSA
- **eBay/Fanatics Upload** — Multi-platform listing automation
- **Offline Queue** — Process photos without internet, sync later

---

## 📫 Contact

Questions ? Reach out via bhimanieshan@gmail.com

---

*Built to solve real problems in the sports card trading ecosystem while exploring scalable full-stack architecture.*
