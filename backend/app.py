"""
CollectHub API — entry point.

Responsibilities of this file:
  - Create the FastAPI application
  - Register middleware (CORS, rate-limiting)
  - Mount all routers
  - Expose /health and / system endpoints
  - Run DB migrations on startup via lifespan

Everything else lives in api/, models/, schemas/, middleware/, db/.
"""
import asyncio
import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from config import settings
from db.database import engine
import models  # noqa: F401 — registers all ORM models with Base.metadata
from db.database import Base
from api import auth, crop, uploads, collections, wants, auctions, drive, invoice, psa, shipment

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)

# ── Rate limiter (shared across all routes) ──────────────────────────────────
limiter = Limiter(key_func=get_remote_address)


# ── Lifespan: DB setup on startup ────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ready — environment: %s", settings.environment)

    from tasks.drive_poller import start_drive_poller
    from tasks.shipment_poller import start_shipment_poller
    drive_task = asyncio.create_task(start_drive_poller(app))
    shipment_task = asyncio.create_task(start_shipment_poller(app))

    yield

    drive_task.cancel()
    shipment_task.cancel()
    logger.info("CollectHub API shutting down")


# ── Application ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="CollectHub API",
    description="Sports card collection management — crop, grade, track, auction, and trade.",
    version=settings.version,
    lifespan=lifespan,
    # Disable docs in production to reduce attack surface
    docs_url="/docs" if settings.environment != "production" else None,
    redoc_url="/redoc" if settings.environment != "production" else None,
)

# ── Middleware ────────────────────────────────────────────────────────────────
# The frontend (http://localhost:3000) calls the API cross-origin, so CORS must
# explicitly permit that origin, the Authorization + Content-Type headers used by
# every authenticated fetch, and the full set of HTTP methods the API exposes.
_cors_origins = list(
    dict.fromkeys([*settings.allowed_origins, "http://localhost:3000"])
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,        prefix="/api/auth",   tags=["auth"])
app.include_router(crop.router,        prefix="/api",        tags=["crop"])
app.include_router(uploads.router,     prefix="/api",        tags=["uploads"])
app.include_router(collections.router, prefix="/api",        tags=["collections"])
app.include_router(wants.router,       prefix="/api",        tags=["wants"])
app.include_router(auctions.router,    prefix="/api",        tags=["auctions"])
app.include_router(drive.router,       prefix="/api/drive",  tags=["drive"])
app.include_router(invoice.router,     prefix="/api/invoice", tags=["invoice"])
app.include_router(psa.router,         prefix="/api/psa",    tags=["psa"])
app.include_router(shipment.router,    prefix="/api/shipment", tags=["shipment"])


# ── System endpoints ──────────────────────────────────────────────────────────
@app.get("/health", tags=["system"])
async def health_check():
    return {
        "status": "healthy",
        "version": settings.version,
        "environment": settings.environment,
        "gcs_enabled": settings.gcs_upload_enabled,
    }


@app.get("/", tags=["system"])
async def root():
    return {"message": "CollectHub API", "version": settings.version, "docs": "/docs"}


# ── Dev runner ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host=settings.host,
        port=settings.port,
        reload=settings.environment == "development",
    )
