# Sprea API

FastAPI backend for document ingestion (PDF, DOCX, images) and text extraction.

## Setup

Requires [uv](https://docs.astral.sh/uv/) and (for image OCR) [Tesseract](https://github.com/tesseract-ocr/tesseract) on your system.

```bash
cd apps/api
uv sync
```

## Run

```bash
uv run uvicorn app.main:app --reload --port 8000
```

From repo root via Turbo:

```bash
pnpm dev
```

## Endpoints

- `GET /health` — Health check
- `POST /ingest` — Upload a file (PDF, DOCX, or image); returns `{ "id", "status", "text" }` or `{ "id", "status" }`
- `GET /content/{id}` — Get extracted text for an upload
