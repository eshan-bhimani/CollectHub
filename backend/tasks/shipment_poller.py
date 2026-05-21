import asyncio
import logging
from datetime import datetime, timezone

from db.database import SessionLocal
from models.shipment import Shipment
from models.user import User
from utils.shipment_tracker import (
    MILESTONE_MAP,
    TrackingError,
    get_tracking_update,
    send_milestone_email,
)

logger = logging.getLogger(__name__)


def _poll_shipment(shipment_id: str) -> None:
    db = SessionLocal()
    try:
        shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
        if not shipment or not shipment.is_active:
            return

        try:
            update = get_tracking_update(shipment.tracking_number, shipment.carrier)
        except TrackingError:
            logger.exception("[Shipment Poller] %s — tracking API failed", shipment.tracking_number)
            shipment.last_polled_at = datetime.now(timezone.utc)
            db.commit()
            return

        new_status = update.get("status")
        logger.info("[Shipment Poller] %s — status: %s", shipment.tracking_number, new_status)

        if new_status and new_status != shipment.current_status:
            milestone = MILESTONE_MAP.get(new_status)
            if milestone:
                user = db.query(User).filter(User.id == shipment.user_id).first()
                if user:
                    try:
                        send_milestone_email(
                            user.email,
                            shipment.tracking_number,
                            milestone,
                            update.get("detail") or "",
                            shipment.destination,
                        )
                    except Exception:
                        logger.exception(
                            "[Shipment Poller] %s — email send failed",
                            shipment.tracking_number,
                        )

            shipment.current_status = new_status
            shipment.current_status_detail = update.get("detail")
            shipment.eta = update.get("eta")

            if new_status == "DELIVERED":
                shipment.delivered_at = datetime.now(timezone.utc)
                shipment.is_active = False
            elif new_status == "RETURNED":
                shipment.is_active = False

        shipment.last_polled_at = datetime.now(timezone.utc)
        db.commit()
    except Exception:
        logger.exception("[Shipment Poller] failed for shipment %s", shipment_id)
    finally:
        db.close()


async def start_shipment_poller(app):
    logger.info("Shipment poller started — interval 600s")

    while True:
        await asyncio.sleep(600)
        try:
            db = SessionLocal()
            try:
                active_ids = [
                    row.id
                    for row in db.query(Shipment.id).filter(Shipment.is_active == True).all()  # noqa: E712
                ]
            finally:
                db.close()

            for sid in active_ids:
                try:
                    await asyncio.to_thread(_poll_shipment, sid)
                except Exception:
                    logger.exception("[Shipment Poller] unhandled error for %s", sid)
        except Exception:
            logger.exception("Shipment poller cycle failed")
