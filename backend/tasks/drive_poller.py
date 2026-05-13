import asyncio
import logging
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from config import settings
from db.database import SessionLocal
from models.drive import DriveToken, WatchedFolder
from utils.google_drive import GoogleDriveClient, decrypt_token
from utils.image_processor import CardCropper

logger = logging.getLogger(__name__)


def poll_user(user_id: str, db: Session) -> int:
    token_row = db.query(DriveToken).filter(DriveToken.user_id == user_id).first()
    if not token_row or not token_row.encrypted_refresh_token:
        return 0

    try:
        client = GoogleDriveClient(decrypt_token(token_row.encrypted_refresh_token))
    except Exception:
        logger.exception("Failed to create Drive client for user %s", user_id)
        return 0

    cropper = CardCropper()
    processed = 0

    folders = (
        db.query(WatchedFolder)
        .filter(WatchedFolder.user_id == user_id, WatchedFolder.is_active == True)  # noqa: E712
        .all()
    )

    for folder in folders:
        try:
            images = client.list_new_images(folder.folder_id, folder.last_polled_at)
        except Exception:
            logger.exception("Failed listing images in folder %s", folder.folder_id)
            continue

        for img in images:
            try:
                data = client.download_file(img["id"])
                result = cropper.crop_card(data)
                if not result["success"]:
                    logger.info("Crop failed for %s: %s", img["name"], result.get("message"))
                    continue

                import base64
                cropped_bytes = base64.b64decode(
                    result["cropped_image"].split(",", 1)[1]
                    if "," in result["cropped_image"]
                    else result["cropped_image"]
                )

                if not folder.cropped_folder_id:
                    folder.cropped_folder_id = client.get_or_create_cropped_folder(
                        folder.folder_id
                    )

                stem = img["name"].rsplit(".", 1)[0]
                client.upload_file(
                    folder.cropped_folder_id, f"{stem}_cropped.png", cropped_bytes
                )
                processed += 1
                logger.info("Cropped and uploaded %s", img["name"])
            except Exception:
                logger.exception("Failed processing image %s", img.get("name", img.get("id")))

        folder.last_polled_at = datetime.now(timezone.utc)
        db.commit()

    return processed


async def start_drive_poller(app):
    interval = settings.drive_poll_interval_seconds
    logger.info("Drive poller started — interval %ds", interval)

    while True:
        await asyncio.sleep(interval)
        try:
            db = SessionLocal()
            try:
                user_ids = [
                    row.user_id
                    for row in db.query(DriveToken.user_id)
                    .filter(DriveToken.encrypted_refresh_token != "")
                    .all()
                ]
            finally:
                db.close()

            for uid in user_ids:
                try:
                    db = SessionLocal()
                    try:
                        await asyncio.to_thread(poll_user, uid, db)
                    finally:
                        db.close()
                except Exception:
                    logger.exception("Poll failed for user %s", uid)
        except Exception:
            logger.exception("Drive poller cycle failed")
