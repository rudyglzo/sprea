# Sprea

**Read faster than you can think.**

Sprea is an intelligent study assistant: upload documents (PDF, DOCX, images), extract text, and speed-read with an RSVP (Rapid Serial Visual Presentation) reader—one word at a time, no left-to-right scanning.

## Tech stack

- **Frontend**: Next.js (TypeScript) — [apps/web](apps/web)
- **Backend**: FastAPI (Python) with [uv](https://docs.astral.sh/uv/) — [apps/api](apps/api)
- **Monorepo**: Turborepo + pnpm
- **Extraction**: PyMuPDF (PDF), python-docx (DOCX), Pillow + pytesseract (images, optional; requires [Tesseract](https://github.com/tesseract-ocr/tesseract) installed)

## Prerequisites

- Node.js 18+, pnpm
- Python 3.11+, [uv](https://docs.astral.sh/uv/getting-started/installation/)
- For image OCR: Tesseract installed on your system

## Quick start

```bash
# Install JS dependencies
pnpm install

# Run API (from repo root; requires uv on PATH)
pnpm --filter api dev

# In another terminal: run web app
pnpm --filter web dev
```

Then open [http://localhost:3000](http://localhost:3000). Upload a document, then click **Start reading** to use the RSVP reader.

To run both API and web together (each in its own process):

```bash
pnpm dev
```

This starts web (port 3000), docs (3001), and api (8000). To run only web + api:

```bash
pnpm exec turbo run dev --filter=web --filter=api
```

## Environment

Optional: copy [.env.example](.env.example) to `.env.local` in the repo root or in `apps/web` if you need to override the API URL:

- `NEXT_PUBLIC_API_URL` — default `http://localhost:8000`

## Project structure

| Path | Description |
|------|-------------|
| [apps/web](apps/web) | Next.js app — upload UI and RSVP reader |
| [apps/api](apps/api) | FastAPI app — ingest + extract, `GET /content/:id` |
| [apps/docs](apps/docs) | Next.js docs app (for future use: store/reread docs) |
| [packages/ui](packages/ui) | Shared React components |

## Build

```bash
pnpm build
```

Builds all apps. To build only web or api:

```bash
pnpm exec turbo run build --filter=web
pnpm exec turbo run build --filter=api
```

## API-only (Python)

```bash
cd apps/api
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

- **Endpoints**: `GET /health`, `POST /ingest`, `GET /content/{id}`

---

*Sprea — polyglot monorepo (Next.js + FastAPI, Turborepo + uv). No account required; content is in-memory and cleared on API restart.*
