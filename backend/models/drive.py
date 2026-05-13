from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from datetime import datetime, timezone
import uuid

from db.database import Base


class DriveToken(Base):
    __tablename__ = "drive_tokens"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"),
        unique=True, nullable=False, index=True,
    )
    encrypted_refresh_token = Column(Text, nullable=False)
    access_token = Column(Text, nullable=True)
    token_expiry = Column(DateTime(timezone=True), nullable=True)
    oauth_state = Column(String(64), nullable=True)
    connected_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class WatchedFolder(Base):
    __tablename__ = "watched_folders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    folder_id = Column(String(200), nullable=False)
    folder_name = Column(String(255), nullable=False)
    cropped_folder_id = Column(String(200), nullable=True)
    last_polled_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
