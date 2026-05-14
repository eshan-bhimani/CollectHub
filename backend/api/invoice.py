import asyncio
import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from config import settings
from db.database import get_db, SessionLocal
from middleware.auth import get_current_user
from models.card import Card
from models.invoice import InvoiceImport, PSACredential
from models.user import User
from utils.google_drive import decrypt_token
from utils.invoice_parser import extract_invoice
from utils.psa_client import PSAClient, PSACertNotFoundError, PSARateLimitError

logger = logging.getLogger(__name__)
router = APIRouter()


def process_item(import_id: str, item: dict, user_id: str) -> None:
    db = SessionLocal()
    try:
        inv = db.query(InvoiceImport).filter(InvoiceImport.id == import_id).first()
        if not inv:
            return

        is_pending = item.get("_pending", False)
        cert_number = item.get("cert_number")

        front_url = None
        back_url = None

        psa_cred = db.query(PSACredential).filter(PSACredential.user_id == user_id).first()

        if cert_number and psa_cred and not is_pending:
            try:
                token = decrypt_token(psa_cred.encrypted_psa_token)
                client = PSAClient(token)

                existing = db.query(Card).filter(
                    Card.cert_number == cert_number, Card.owner_id == user_id
                ).first()
                if not existing:
                    client.get_cert(cert_number)

                try:
                    images = client.get_cert_images(cert_number)
                    front_url = images.get("FrontImageURL") or images.get("frontImageUrl")
                    back_url = images.get("BackImageURL") or images.get("backImageUrl")
                except (PSACertNotFoundError, PSARateLimitError):
                    pass
            except Exception:
                logger.exception("PSA API failed for cert %s", cert_number)
                is_pending = True

        import_status = "pending_review" if is_pending else "synced"

        card = Card(
            owner_id=user_id,
            player_name=item.get("player_name", "Unknown"),
            year=item.get("year"),
            brand=item.get("brand"),
            card_number=item.get("card_number"),
            variation=item.get("variation"),
            condition="graded" if item.get("grade") else None,
            grade=item.get("grade"),
            grading_company=item.get("grading_company"),
            cert_number=cert_number,
            purchase_price=item.get("final_bid"),
            front_image_url=front_url,
            back_image_url=back_url,
            lot_number=item.get("lot_number"),
            import_status=import_status,
            invoice_import_id=import_id,
        )
        db.add(card)

        if import_status == "synced":
            if psa_cred and cert_number:
                try:
                    from utils.psa_registry import is_in_registry, add_to_registry

                    psa_email = psa_cred.psa_email
                    psa_token = decrypt_token(psa_cred.encrypted_psa_token)
                    if not is_in_registry(psa_email, psa_token, cert_number):
                        if not add_to_registry(psa_email, psa_token, cert_number):
                            card.import_status = "pending_review"
                            import_status = "pending_review"
                except Exception:
                    logger.exception("Registry sync failed for cert %s", cert_number)
                    card.import_status = "pending_review"
                    import_status = "pending_review"

            inv.items_synced += 1
        else:
            inv.items_pending += 1

        if inv.items_synced + inv.items_pending >= inv.items_count:
            if inv.items_pending == 0:
                inv.status = "complete"
            elif inv.items_synced == 0:
                inv.status = "failed"
            else:
                inv.status = "partial"

        db.commit()
    except Exception:
        logger.exception("process_item failed for import %s", import_id)
        try:
            inv = db.query(InvoiceImport).filter(InvoiceImport.id == import_id).first()
            if inv:
                inv.items_pending += 1
                if inv.items_synced + inv.items_pending >= inv.items_count:
                    inv.status = "partial" if inv.items_synced > 0 else "failed"
                db.commit()
        except Exception:
            logger.exception("Failed to update import status after error")
    finally:
        db.close()


async def _run_processing(import_id: str, items: list[dict], user_id: str) -> None:
    for item in items:
        try:
            await asyncio.to_thread(process_item, import_id, item, user_id)
        except Exception:
            logger.exception("Background processing failed for item in import %s", import_id)


@router.post("/upload")
async def invoice_upload(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.content_type or "pdf" not in file.content_type:
        raise HTTPException(status_code=400, detail="File must be a PDF")

    pdf_bytes = await file.read()

    try:
        data = await asyncio.to_thread(extract_invoice, pdf_bytes)
    except Exception:
        logger.exception("Invoice parsing failed")
        raise HTTPException(status_code=422, detail="Failed to parse invoice PDF")

    items = data.get("items", [])
    inv = InvoiceImport(
        user_id=current_user.id,
        invoice_number=data.get("invoice_number", ""),
        auction_name=data.get("auction_name", ""),
        invoice_date=data.get("invoice_date"),
        tracking_number=data.get("tracking_number"),
        lot_total=data.get("lot_total", 0),
        buyers_premium=data.get("buyers_premium", 0),
        shipping=data.get("shipping", 0),
        sales_tax=data.get("sales_tax", 0),
        insurance=data.get("insurance", 0),
        grand_total=data.get("grand_total", 0),
        items_count=len(items),
        status="processing",
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)

    background_tasks.add_background_task(_run_processing, inv.id, items, current_user.id)

    return {"import_id": inv.id, "items_count": len(items), "status": "processing"}


@router.get("/status/{import_id}")
def invoice_status(
    import_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    inv = (
        db.query(InvoiceImport)
        .filter(InvoiceImport.id == import_id, InvoiceImport.user_id == current_user.id)
        .first()
    )
    if not inv:
        raise HTTPException(status_code=404, detail="Import not found")
    return {
        "id": inv.id,
        "invoice_number": inv.invoice_number,
        "auction_name": inv.auction_name,
        "items_count": inv.items_count,
        "items_synced": inv.items_synced,
        "items_pending": inv.items_pending,
        "status": inv.status,
        "grand_total": inv.grand_total,
    }


@router.get("/history")
def invoice_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(InvoiceImport)
        .filter(InvoiceImport.user_id == current_user.id)
        .order_by(InvoiceImport.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "invoice_number": r.invoice_number,
            "auction_name": r.auction_name,
            "items_count": r.items_count,
            "items_synced": r.items_synced,
            "items_pending": r.items_pending,
            "status": r.status,
            "grand_total": r.grand_total,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


@router.get("/pending")
def invoice_pending(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(Card)
        .filter(Card.owner_id == current_user.id, Card.import_status == "pending_review")
        .all()
    )
    return [
        {
            "id": r.id,
            "player_name": r.player_name,
            "year": r.year,
            "brand": r.brand,
            "card_number": r.card_number,
            "cert_number": r.cert_number,
            "grade": r.grade,
            "lot_number": r.lot_number,
            "purchase_price": r.purchase_price,
        }
        for r in rows
    ]
