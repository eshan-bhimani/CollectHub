import logging
import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from config import settings
from db.database import get_db
from middleware.auth import get_current_user
from models.drive import DriveToken, WatchedFolder
from models.user import User
from utils.google_drive import GoogleDriveClient, decrypt_token, encrypt_token

logger = logging.getLogger(__name__)
router = APIRouter()


class WatchRequest(BaseModel):
    folder_id: str
    folder_name: str


# ── OAuth flow ───────────────────────────────────────────────────────────────

@router.get("/auth")
def drive_auth(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    random_part = secrets.token_urlsafe(16)
    state = f"{current_user.id}:{random_part}"

    token_row = db.query(DriveToken).filter(DriveToken.user_id == current_user.id).first()
    if token_row:
        token_row.oauth_state = random_part
    else:
        token_row = DriveToken(
            user_id=current_user.id,
            encrypted_refresh_token="",
            oauth_state=random_part,
        )
        db.add(token_row)
    db.commit()

    auth_url = GoogleDriveClient.get_authorization_url(state)
    return {"auth_url": auth_url}


@router.get("/callback")
def drive_callback(
    code: str = Query(...),
    state: str = Query(...),
    db: Session = Depends(get_db),
):
    redirect_ok = "http://localhost:3000/crop?drive=connected"
    redirect_err = "http://localhost:3000/crop?drive=error"

    parts = state.split(":", 1)
    if len(parts) != 2:
        return RedirectResponse(redirect_err)
    user_id, random_part = parts

    token_row = db.query(DriveToken).filter(DriveToken.user_id == user_id).first()
    if not token_row or token_row.oauth_state != random_part:
        return RedirectResponse(redirect_err)

    try:
        tokens = GoogleDriveClient.exchange_code(code)
    except Exception:
        logger.exception("Google Drive token exchange failed")
        return RedirectResponse(redirect_err)

    token_row.encrypted_refresh_token = encrypt_token(tokens["refresh_token"])
    token_row.access_token = tokens["access_token"]
    token_row.token_expiry = tokens.get("expiry")
    token_row.oauth_state = None
    token_row.connected_at = datetime.now(timezone.utc)
    db.commit()

    return RedirectResponse(redirect_ok)


# ── Authenticated routes ─────────────────────────────────────────────────────

@router.get("/status")
def drive_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    token_row = db.query(DriveToken).filter(DriveToken.user_id == current_user.id).first()
    connected = bool(token_row and token_row.encrypted_refresh_token)
    folders_watched = (
        db.query(WatchedFolder)
        .filter(WatchedFolder.user_id == current_user.id, WatchedFolder.is_active == True)  # noqa: E712
        .count()
    ) if connected else 0
    return {"connected": connected, "folders_watched": folders_watched}


@router.get("/disconnect")
def drive_disconnect(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(WatchedFolder).filter(WatchedFolder.user_id == current_user.id).delete()
    db.query(DriveToken).filter(DriveToken.user_id == current_user.id).delete()
    db.commit()
    return {"disconnected": True}


@router.get("/folders")
def drive_folders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    token_row = db.query(DriveToken).filter(DriveToken.user_id == current_user.id).first()
    if not token_row or not token_row.encrypted_refresh_token:
        raise HTTPException(status_code=400, detail="Google Drive not connected")
    client = GoogleDriveClient(decrypt_token(token_row.encrypted_refresh_token))
    return client.list_folders()


@router.post("/watch")
def drive_watch(
    body: WatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = (
        db.query(WatchedFolder)
        .filter(
            WatchedFolder.user_id == current_user.id,
            WatchedFolder.folder_id == body.folder_id,
            WatchedFolder.is_active == True,  # noqa: E712
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Folder already watched")
    folder = WatchedFolder(
        user_id=current_user.id,
        folder_id=body.folder_id,
        folder_name=body.folder_name,
    )
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return {"id": folder.id, "folder_id": folder.folder_id, "folder_name": folder.folder_name}


@router.get("/watched")
def drive_watched(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(WatchedFolder)
        .filter(WatchedFolder.user_id == current_user.id, WatchedFolder.is_active == True)  # noqa: E712
        .all()
    )
    return [
        {
            "id": r.id,
            "folder_id": r.folder_id,
            "folder_name": r.folder_name,
            "last_polled_at": r.last_polled_at.isoformat() if r.last_polled_at else None,
        }
        for r in rows
    ]


@router.delete("/watch/{folder_id}")
def drive_unwatch(
    folder_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    row = (
        db.query(WatchedFolder)
        .filter(
            WatchedFolder.user_id == current_user.id,
            WatchedFolder.folder_id == folder_id,
            WatchedFolder.is_active == True,  # noqa: E712
        )
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Watched folder not found")
    row.is_active = False
    db.commit()
    return {"stopped": True}


@router.post("/poll/trigger")
def drive_poll_trigger(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from tasks.drive_poller import poll_user

    token_row = db.query(DriveToken).filter(DriveToken.user_id == current_user.id).first()
    if not token_row or not token_row.encrypted_refresh_token:
        raise HTTPException(status_code=400, detail="Google Drive not connected")

    processed = poll_user(current_user.id, db)
    return {"triggered": True, "images_processed": processed}
