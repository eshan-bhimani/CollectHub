import json
import logging
import re
from datetime import datetime

import pdfplumber

from config import settings

logger = logging.getLogger(__name__)

_DESCRIPTION_RE = re.compile(
    r"(\d{7,})\s*-\s*(\d{4})\s+([\w\s&'./-]+?)\s+(\S+)\s+"
    r"([\w\s&'./-]+?)\s+(?:([\w\s]+?)\s+)?PSA\s+([\w+\-]+)\s+([\d.]+)$"
)


def _parse_description_regex(desc: str) -> dict | None:
    m = _DESCRIPTION_RE.match(desc.strip())
    if not m:
        return None
    player_raw = m.group(5).strip()
    variation_raw = m.group(6)
    return {
        "cert_number": m.group(1),
        "year": int(m.group(2)),
        "brand": m.group(3).strip(),
        "card_number": m.group(4),
        "player_name": player_raw,
        "variation": variation_raw.strip() if variation_raw else None,
        "grading_company": "PSA",
        "grade_label": m.group(7),
        "grade": float(m.group(8)),
    }


def _parse_with_gemini(descriptions: list[str]) -> list[dict] | None:
    if not settings.gemini_api_key:
        logger.warning("GEMINI_API_KEY not set — skipping AI parse")
        return None
    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(
            f"Parse these sports card descriptions.\n"
            f"Return ONLY a JSON array, no markdown. Each object: "
            f"cert_number (str), year (int), brand (str), card_number (str), "
            f"player_name (str), variation (str|null), grading_company (str), "
            f"grade_label (str), grade (float).\n"
            f"Descriptions: {json.dumps(descriptions)}"
        )
        text = response.text.strip()
        if text.startswith("```"):
            text = re.sub(r"^```\w*\n?", "", text)
            text = re.sub(r"\n?```$", "", text)
        return json.loads(text)
    except Exception:
        logger.exception("Gemini parse failed")
        return None


def _extract_float(text: str) -> float:
    m = re.search(r"[\d,]+\.\d{2}", text.replace(",", ""))
    return float(m.group()) if m else 0.0


def extract_invoice(pdf_bytes: bytes) -> dict:
    with pdfplumber.open(pdf_bytes if hasattr(pdf_bytes, "read") else __import__("io").BytesIO(pdf_bytes)) as pdf:
        full_text = "\n".join(page.extract_text() or "" for page in pdf.pages)

    invoice_number = ""
    m = re.search(r"Invoice\s*#?\s*[:\s]*(\S+)", full_text, re.IGNORECASE)
    if m:
        invoice_number = m.group(1)

    invoice_date = None
    m = re.search(r"(?:Date|Invoice Date)\s*[:\s]*([\d/\-]+)", full_text, re.IGNORECASE)
    if m:
        for fmt in ("%m/%d/%Y", "%Y-%m-%d", "%m-%d-%Y"):
            try:
                invoice_date = datetime.strptime(m.group(1), fmt).isoformat()
                break
            except ValueError:
                continue

    tracking_number = None
    m = re.search(r"(?:Tracking|Track)\s*#?\s*[:\s]*(\S+)", full_text, re.IGNORECASE)
    if m:
        tracking_number = m.group(1)

    auction_name = ""
    m = re.search(r"([\w\s]+Auction\s*#?\s*\d+)", full_text, re.IGNORECASE)
    if m:
        auction_name = m.group(1).strip()

    lot_total = _extract_float(
        (re.search(r"Lot\s*Total.*?([\d,]+\.\d{2})", full_text, re.IGNORECASE) or type("", (), {"group": lambda s, n=0: "0.00"})()).group(1)  # type: ignore[arg-type]
    ) if re.search(r"Lot\s*Total", full_text, re.IGNORECASE) else 0.0

    buyers_premium = 0.0
    m = re.search(r"(?:Buyer.?s?\s*Premium|BP).*?([\d,]+\.\d{2})", full_text, re.IGNORECASE)
    if m:
        buyers_premium = float(m.group(1).replace(",", ""))

    shipping = 0.0
    m = re.search(r"Shipping.*?([\d,]+\.\d{2})", full_text, re.IGNORECASE)
    if m:
        shipping = float(m.group(1).replace(",", ""))

    sales_tax = 0.0
    m = re.search(r"(?:Sales\s*Tax|Tax).*?([\d,]+\.\d{2})", full_text, re.IGNORECASE)
    if m:
        sales_tax = float(m.group(1).replace(",", ""))

    insurance = 0.0
    m = re.search(r"Insurance.*?([\d,]+\.\d{2})", full_text, re.IGNORECASE)
    if m:
        insurance = float(m.group(1).replace(",", ""))

    grand_total = 0.0
    m = re.search(r"(?:Grand\s*Total|Total\s*Due|Amount\s*Due).*?([\d,]+\.\d{2})", full_text, re.IGNORECASE)
    if m:
        grand_total = float(m.group(1).replace(",", ""))

    raw_items = []
    for line in full_text.split("\n"):
        line = line.strip()
        lot_match = re.match(r"^(\d{1,4})\s+(.+?)\s+([\d,]+\.\d{2})\s*$", line)
        if lot_match and re.search(r"\d{7}\s*-\s*", lot_match.group(2)):
            raw_items.append({
                "lot_number": lot_match.group(1),
                "description": lot_match.group(2).strip(),
                "final_bid": float(lot_match.group(3).replace(",", "")),
            })

    descriptions = [it["description"] for it in raw_items]
    parsed_list = None
    if descriptions:
        parsed_list = _parse_with_gemini(descriptions)

    items = []
    for i, raw in enumerate(raw_items):
        parsed = None
        if parsed_list and i < len(parsed_list):
            parsed = parsed_list[i]

        if not parsed:
            parsed = _parse_description_regex(raw["description"])

        if parsed:
            items.append({
                "lot_number": raw["lot_number"],
                "final_bid": raw["final_bid"],
                **parsed,
            })
        else:
            items.append({
                "lot_number": raw["lot_number"],
                "final_bid": raw["final_bid"],
                "description_raw": raw["description"],
                "cert_number": None,
                "year": None,
                "brand": None,
                "card_number": None,
                "player_name": raw["description"],
                "variation": None,
                "grading_company": "PSA",
                "grade_label": None,
                "grade": None,
                "_pending": True,
            })

    return {
        "invoice_number": invoice_number,
        "auction_name": auction_name,
        "invoice_date": invoice_date,
        "tracking_number": tracking_number,
        "lot_total": lot_total,
        "buyers_premium": buyers_premium,
        "shipping": shipping,
        "sales_tax": sales_tax,
        "insurance": insurance,
        "grand_total": grand_total,
        "items": items,
    }
