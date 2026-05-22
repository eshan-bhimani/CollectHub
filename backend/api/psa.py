import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.database import get_db
from middleware.auth import get_current_user
from models.invoice import PSACredential
from models.user import User
from utils.google_drive import encrypt_token
from utils.psa_client import PSAClient, PSAAuthError, PSARateLimitError

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/ping")
def psa_ping():
    return {"ok": True}


class PSAConnectRequest(BaseModel):
    email: str
    password: str


@router.post("/connect")
def psa_connect(
    body: PSAConnectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = PSAClient.get_token(body.email, body.password)
    except PSAAuthError:
        raise HTTPException(status_code=401, detail="Invalid PSA email or password")
    except PSARateLimitError:
        raise HTTPException(status_code=429, detail="PSA API rate limit exceeded")
    except Exception:
        logger.exception("PSA connect failed")
        raise HTTPException(status_code=502, detail="Could not reach PSA — try again later")

    encrypted = encrypt_token(result["access_token"])
    expiry = datetime.now(timezone.utc) + timedelta(seconds=result["expires_in"])

    row = db.query(PSACredential).filter(PSACredential.user_id == current_user.id).first()
    if row:
        row.encrypted_psa_token = encrypted
        row.token_expiry = expiry
        row.psa_email = body.email
        row.connected_at = datetime.now(timezone.utc)
    else:
        row = PSACredential(
            user_id=current_user.id,
            encrypted_psa_token=encrypted,
            token_expiry=expiry,
            psa_email=body.email,
        )
        db.add(row)
    db.commit()

    return {"connected": True}


@router.get("/status")
def psa_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    row = db.query(PSACredential).filter(PSACredential.user_id == current_user.id).first()
    if not row:
        return {"connected": False, "email": None, "token_expires": None}
    return {
        "connected": True,
        "email": row.psa_email,
        "token_expires": row.token_expiry.isoformat() if row.token_expiry else None,
    }


@router.delete("/disconnect")
def psa_disconnect(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(PSACredential).filter(PSACredential.user_id == current_user.id).delete()
    db.commit()
    return {"disconnected": True}
