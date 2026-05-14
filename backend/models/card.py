from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from db.database import Base


class Card(Base):
    __tablename__ = "cards"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # ── Card identity ──────────────────────────────────────────────────────────
    player_name = Column(String(120), nullable=False, index=True)
    year = Column(Integer, index=True)
    brand = Column(String(80))        # Topps, Bowman, Panini, Upper Deck …
    set_name = Column(String(120))
    card_number = Column(String(30))
    variation = Column(String(120))   # Rookie, Refractor, Prizm, Auto …

    # ── Grading ────────────────────────────────────────────────────────────────
    condition = Column(String(30))    # "raw" | "graded"
    grade = Column(Float)             # e.g. 10, 9.5, 8
    grading_company = Column(String(20))   # PSA, BGS, SGC, CSG
    cert_number = Column(String(30), index=True)

    # ── Value ─────────────────────────────────────────────────────────────────
    purchase_price = Column(Float)
    current_value = Column(Float)

    # ── Images (GCS or external URLs) ─────────────────────────────────────────
    front_image_url = Column(String(500))
    back_image_url = Column(String(500))

    # ── Marketplace ────────────────────────────────────────────────────────────
    is_for_sale = Column(Boolean, default=False, nullable=False)
    asking_price = Column(Float)

    # ── Invoice import ────────────────────────────────────────────────────────
    lot_number = Column(String(20), nullable=True)
    import_status = Column(String(20), nullable=True)
    invoice_import_id = Column(
        String(36), ForeignKey("invoice_imports.id"), nullable=True
    )

    notes = Column(Text)

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

    owner = relationship("User", back_populates="cards")
    invoice_import = relationship("InvoiceImport", back_populates="cards")
