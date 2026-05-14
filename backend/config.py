from pydantic_settings import BaseSettings
from typing import Optional, List


class Settings(BaseSettings):
    """Application settings — loaded from environment variables / .env file."""

    # ── Server ────────────────────────────────────────────────────────────────
    port: int = 8000
    host: str = "0.0.0.0"
    environment: str = "development"
    version: str = "2.0.0"

    # ── CORS — explicit allowlist instead of wildcard ─────────────────────────
    # In production set ALLOWED_ORIGINS=https://yourcollecthub.com
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]

    # ── JWT Authentication ─────────────────────────────────────────────────────
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # ── Database ───────────────────────────────────────────────────────────────
    # SQLite for local dev; swap to postgresql:// for production
    database_url: str = "sqlite:///./collecthub.db"

    # ── Google OAuth (future) ──────────────────────────────────────────────────
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    google_redirect_uri: str = "http://localhost:8000/api/auth/google/callback"

    # ── Google Drive Integration ──────────────────────────────────────────────
    google_drive_redirect_uri: str = "http://localhost:8000/api/drive/callback"
    drive_poll_interval_seconds: int = 300
    drive_encryption_key: Optional[str] = None

    # ── Gemini AI ──────────────────────────────────────────────────────────────
    gemini_api_key: Optional[str] = None

    # ── Google Cloud Storage ───────────────────────────────────────────────────
    gcs_bucket_name: Optional[str] = None
    gcs_credentials_path: Optional[str] = None
    gcs_default_user_id: str = "admin"
    gcs_signed_url_expiration_minutes: int = 60
    gcs_upload_enabled: bool = False

    # ── Image Processing ───────────────────────────────────────────────────────
    max_image_size_mb: int = 10
    # Was 3 s — too low; real CV pipeline takes 5-20 s depending on image
    crop_timeout_seconds: int = 30

    # ── Rate Limiting ──────────────────────────────────────────────────────────
    rate_limit_auth: str = "10/minute"
    rate_limit_crop: str = "20/minute"
    rate_limit_default: str = "60/minute"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
