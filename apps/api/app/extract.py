"""Extract plain text from PDF, DOCX, and images."""

from io import BytesIO

import fitz  # pymupdf
import pytesseract
from docx import Document as DocxDocument
from PIL import Image


def extract_text(raw: bytes, ext: str, content_type: str) -> str:
    ext = ext.lower()
    if ext == ".pdf":
        return _extract_pdf(raw)
    if ext in (".docx", ".doc"):
        return _extract_docx(raw)
    if ext in (".png", ".jpg", ".jpeg", ".gif", ".webp", ".tiff", ".bmp"):
        return _extract_image(raw)
    raise ValueError(f"Unsupported extension: {ext}")


def _extract_pdf(raw: bytes) -> str:
    doc = fitz.open(stream=raw, filetype="pdf")
    parts = []
    for page in doc:
        parts.append(page.get_text())
    doc.close()
    return "\n\n".join(parts).strip() or ""


def _extract_docx(raw: bytes) -> str:
    doc = DocxDocument(BytesIO(raw))
    return "\n\n".join(p.text for p in doc.paragraphs).strip() or ""


def _extract_image(raw: bytes) -> str:
    img = Image.open(BytesIO(raw))
    if img.mode not in ("L", "RGB", "RGBA"):
        img = img.convert("RGB")
    return pytesseract.image_to_string(img).strip() or ""
