from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from db.database import Base


class PSACredential(Base):
    __tablename__ = "psa_credentials"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"),
        unique=True, nullable=False, index=True,
    )
    encrypted_psa_token = Column(Text, nullable=False)
    token_expiry = Column(DateTime(timezone=True), nullable=True)
    psa_email = Column(String(255), nullable=False)
    connected_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class InvoiceImport(Base):
    __tablename__ = "invoice_imports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    invoice_number = Column(String(50), nullable=False)
    auction_name = Column(String(255), nullable=False)
    invoice_date = Column(DateTime(timezone=True), nullable=True)
    tracking_number = Column(String(100), nullable=True)
    lot_total = Column(Float, nullable=False)
    buyers_premium = Column(Float, nullable=False)
    shipping = Column(Float, nullable=False)
    sales_tax = Column(Float, nullable=False)
    insurance = Column(Float, nullable=False)
    grand_total = Column(Float, nullable=False)
    items_count = Column(Integer, nullable=False)
    items_synced = Column(Integer, default=0, nullable=False)
    items_pending = Column(Integer, default=0, nullable=False)
    status = Column(String(20), default="processing", nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    cards = relationship("Card", back_populates="invoice_import")
