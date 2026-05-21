import logging

import resend
import shippo

from config import settings

logger = logging.getLogger(__name__)

MILESTONE_MAP = {
    "TRANSIT": "Your package is in transit",
    "OUT_FOR_DELIVERY": "Your package is out for delivery",
    "DELIVERED": "Your package has been delivered to the vault",
    "RETURNED": "Your package is being returned",
    "FAILURE": "There was a delivery failure",
    "UNKNOWN": None,
}


class TrackingError(Exception):
    pass


def detect_carrier(tracking_number: str) -> str:
    tn = tracking_number.strip()
    if tn.upper().startswith("1Z"):
        return "ups"
    if tn.startswith("9") and tn.isdigit() and 20 <= len(tn) <= 22:
        return "usps"
    if tn.isdigit() and len(tn) in (12, 15):
        return "fedex"
    return "usps"


def get_tracking_update(tracking_number: str, carrier: str) -> dict:
    client = shippo.Shippo(api_key_header=settings.shippo_api_key)
    try:
        result = client.tracking_status.get(tracking_number, carrier)
        ts = result.tracking_status
        return {
            "status": str(ts.status) if ts else None,
            "detail": ts.status_details if ts else None,
            "eta": result.eta,
            "location": ts.location if ts else None,
        }
    except Exception as exc:
        raise TrackingError(f"Shippo API failed for {tracking_number}: {exc}") from exc


def send_milestone_email(
    user_email: str,
    tracking_number: str,
    milestone: str,
    detail: str,
    destination: str,
) -> None:
    resend.api_key = settings.resend_api_key
    try:
        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": user_email,
            "subject": f"Shipment Update: {milestone}",
            "html": (
                f"<h2>Shipment Update</h2>"
                f"<p>{milestone}</p>"
                f"<p><strong>Tracking:</strong> {tracking_number}</p>"
                f"<p><strong>Destination:</strong> {destination.replace('_', ' ').title()}</p>"
                f"<p><strong>Detail:</strong> {detail or 'No additional details'}</p>"
            ),
        })
    except Exception:
        logger.exception("Failed to send milestone email to %s", user_email)
