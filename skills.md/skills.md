# Project Skill File

## Project Overview

CollectHub is a sports card trading platform. The platform solves the fragmented, manual workflow that sports card collectors face when tracking prices, evaluating bids, and managing their collections across marketplaces like eBay, Fanatics, Goldin, and PWCC. The core workflow is: a collector uploads a card photo → the backend auto-crops it via OpenCV → the AI identifies the card details → the collector can track it in their collection or watch list, and evaluate live auction bids using a configurable pricing strategy. Key business logic includes platform-specific buyer premiums (Goldin 22%, eBay 13%), additive want list matching with grade thresholds, and dynamic value resolution that never hardcodes prices — only pulling currentValue from live auction data.




## Tech Stack

Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
Backend: Python FastAPI + Uvicorn, deployed on Render
Storage: localStorage for collection/want list/strategy/bids; Google Cloud Storage for card images
AI: OpenCV (card detection, live); Anthropic Claude vision via /api/identify-card (planned)
Auth: None yet (Keycloak planned)
Other: Pydantic, NumPy, Pillow, React Native + Expo (Phase 3)


## Architecture

Frontend — Three live feature areas in Next.js:

/auctions — mock auction listings with PricingStrategy bid evaluation, want list badge matching, filter/sort
/settings/pricing — configures and persists PricingStrategy to localStorage
Collection & Want List — CRUD via collectionStore.ts; resolveCurrentValue() derives prices from live listings only

Planned: AI Card Identifier — upload → crop preview → Claude identification → editable form → save to collection
Backend — FastAPI endpoints:

POST /api/crop-image — OpenCV pipeline → base64 cropped image + confidence score
POST /api/upload — saves cropped image to GCS
POST /api/identify-card (planned) — Claude vision → CardIdentification Pydantic model

OpenCV Pipeline — grayscale → blur → threshold + Canny edges → contour filtering (≥5% area, 4–6 vertices) → confidence scoring (aspect ratio 2.5:3.5) → bounding box extraction. Destination dimensions computed via np.linalg.norm — never fixed pixel sizes.
State — No global state library. React hooks + localStorage via collectionStore.ts, pricingStrategy.ts, bidTracker.ts.

## Folder Structure

Sports-Card-Trading/
├── frontend/src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── auctions/page.tsx     # Auction Intelligence UI
│   │   ├── collection/           # Collection tracker
│   │   └── settings/pricing/     # Pricing strategy settings
│   ├── components/
│   │   ├── Auctions/             # AuctionCard, MarketOverview, StrategySummary, etc.
│   │   └── Shared/               # PillBadge, shared UI
│   └── lib/
│       ├── pricingStrategy.ts    # evaluateBid(), platform premiums, localStorage persistence
│       ├── collectionStore.ts    # CRUD + matchWantListItems() + resolveCurrentValue()
│       ├── collectionTypes.ts    # CollectionItem, WantListItem types
│       ├── mockAuctionApi.ts     # Mock listings + AuctionListing type
│       ├── bidTracker.ts         # TrackedBid, BidNotification, alert logic
│       └── api.ts                # HTTP client (identifyCard() planned)
├── backend/
│   ├── app.py                    # All FastAPI routes
│   ├── config.py                 # Env config
│   ├── requirements.txt          # Python deps (NumPy pinned <2)
│   ├── render.yaml               # Render deployment
│   └── utils/
│       ├── image_processor.py    # OpenCV detection + cropping
│       └── gcs_uploader.py       # GCS upload helper
└── mobile/                       # React Native + Expo (Phase 3, not started)

## Commands

# Backend
cd backend && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python app.py                        # http://localhost:8000
python test_api.py test_images/card.jpg  # manual test

# Frontend
cd frontend && npm install
npm run dev                          # http://localhost:3000


# Self-Improvement Rule

Whenever you make progress on this project, fix a bug, discover a new architectural detail, or receive a correction from the user, update the relevant skill file.

If the lesson applies to the whole project, update the root `skills.md`.

If the lesson applies to one directory, update that directory’s `skills.md`.

If the lesson applies to a stack or workflow used across projects, update the relevant global skill file.

Do not add vague notes. Add specific instructions that would help a future agent avoid the same mistake.


