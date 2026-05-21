from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from datetime import datetime, timezone
import uuid

from db.database import Base


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    invoice_import_id = Column(
        String(36), ForeignKey("invoice_imports.id", ondelete="SET NULL"),
        nullable=True,
    )
    tracking_number = Column(String(100), nullable=False)
    carrier = Column(String(20), nullable=False)
    current_status = Column(String(30), nullable=True)
    current_status_detail = Column(String(500), nullable=True)
    eta = Column(DateTime(timezone=True), nullable=True)
    origin_address = Column(String(255), nullable=True)
    destination = Column(String(50), nullable=False, default="other")
    last_polled_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
