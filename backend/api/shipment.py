import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.database import get_db
from middleware.auth import get_current_user
from models.shipment import Shipment
from models.user import User
from utils.shipment_tracker import detect_carrier, get_tracking_update, TrackingError

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/ping")
def shipment_ping():
    return {"ok": True}


class ShipmentCreateRequest(BaseModel):
    tracking_number: str
    destination: str = "other"
    invoice_import_id: str | None = None


def _shipment_to_dict(s: Shipment) -> dict:
    return {
        "id": s.id,
        "tracking_number": s.tracking_number,
        "carrier": s.carrier,
        "current_status": s.current_status,
        "current_status_detail": s.current_status_detail,
        "eta": s.eta.isoformat() if s.eta else None,
        "origin_address": s.origin_address,
        "destination": s.destination,
        "last_polled_at": s.last_polled_at.isoformat() if s.last_polled_at else None,
        "delivered_at": s.delivered_at.isoformat() if s.delivered_at else None,
        "is_active": s.is_active,
        "created_at": s.created_at.isoformat() if s.created_at else None,
        "invoice_import_id": s.invoice_import_id,
    }


def _apply_tracking_update(shipment: Shipment) -> None:
    try:
        update = get_tracking_update(shipment.tracking_number, shipment.carrier)
        shipment.current_status = update.get("status")
        shipment.current_status_detail = update.get("detail")
        shipment.eta = update.get("eta")
        shipment.last_polled_at = datetime.now(timezone.utc)
    except TrackingError:
        logger.warning("Initial tracking fetch failed for %s", shipment.tracking_number)


@router.post("/create")
def shipment_create(
    body: ShipmentCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    carrier = detect_carrier(body.tracking_number)
    shipment = Shipment(
        user_id=current_user.id,
        tracking_number=body.tracking_number.strip(),
        carrier=carrier,
        destination=body.destination,
        invoice_import_id=body.invoice_import_id,
    )
    _apply_tracking_update(shipment)
    db.add(shipment)
    db.commit()
    db.refresh(shipment)
    return _shipment_to_dict(shipment)


@router.get("/list")
def shipment_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(Shipment)
        .filter(Shipment.user_id == current_user.id)
        .order_by(Shipment.created_at.desc())
        .all()
    )
    return [_shipment_to_dict(s) for s in rows]


@router.get("/{shipment_id}")
def shipment_detail(
    shipment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    s = (
        db.query(Shipment)
        .filter(Shipment.id == shipment_id, Shipment.user_id == current_user.id)
        .first()
    )
    if not s:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return _shipment_to_dict(s)


@router.post("/{shipment_id}/refresh")
def shipment_refresh(
    shipment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    s = (
        db.query(Shipment)
        .filter(Shipment.id == shipment_id, Shipment.user_id == current_user.id)
        .first()
    )
    if not s:
        raise HTTPException(status_code=404, detail="Shipment not found")
    _apply_tracking_update(s)
    db.commit()
    db.refresh(s)
    return _shipment_to_dict(s)


@router.delete("/{shipment_id}")
def shipment_delete(
    shipment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    s = (
        db.query(Shipment)
        .filter(Shipment.id == shipment_id, Shipment.user_id == current_user.id)
        .first()
    )
    if not s:
        raise HTTPException(status_code=404, detail="Shipment not found")
    s.is_active = False
    db.commit()
    return {"deactivated": True}
