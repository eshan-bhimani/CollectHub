from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(120), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # cascade="all, delete-orphan" means deleting a user removes all their data
    cards = relationship("Card", back_populates="owner", cascade="all, delete-orphan")
    wants = relationship("WantItem", back_populates="owner", cascade="all, delete-orphan")
    auction_watches = relationship(
        "AuctionWatch", back_populates="owner", cascade="all, delete-orphan"
    )
    psa_credential = relationship(
        "PSACredential", uselist=False, cascade="all, delete-orphan"
    )
    invoice_imports = relationship(
        "InvoiceImport", cascade="all, delete-orphan"
    )
    shipments = relationship(
        "Shipment", cascade="all, delete-orphan"
    )
