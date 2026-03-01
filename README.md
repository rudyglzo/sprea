# sprea

**read faster than you can think.**

sprea is a speed-reading app: upload documents (PDF, DOCX, images) or paste text, extract the content, and read with an RSVP (Rapid Serial Visual Presentation) reader—one word at a time, no left-to-right scanning.

## status: v1

- **upload**: PDF, DOCX, images (PNG, JPG, etc.) — max 50MB per file
- **storage**: in-memory only. content is cleared on API restart. no accounts, no persistence.
- **reader**: RSVP mode with adjustable speed (WPM), play/pause, dark/light theme.
- **deploy**: docker images, runs on a droplet (Caddy + k3s). push to `prod` triggers build and deploy.

## tech stack

- **frontend**: Next.js (TypeScript) — [apps/web](apps/web)
- **backend**: FastAPI (Python) with [uv](https://docs.astral.sh/uv/) — [apps/api](apps/api)
- **monorepo**: Turborepo + pnpm
- **extraction**: PyMuPDF (PDF), python-docx (DOCX), Pillow + pytesseract (images; requires [Tesseract](https://github.com/tesseract-ocr/tesseract) for OCR)

## prerequisites

- Node.js 18+, pnpm
- Python 3.11+, [uv](https://docs.astral.sh/uv/getting-started/installation/)
- for image OCR: Tesseract installed on your system

## quick start

```bash
# install JS dependencies
pnpm install

# run API (from repo root; requires uv on PATH)
pnpm --filter api dev

# in another terminal: run web app
pnpm --filter web dev
```

then open [http://localhost:3000](http://localhost:3000). upload a document or paste text, then click **start reading**.

to run both API and web together:

```bash
pnpm dev
```

or only web + api:

```bash
pnpm exec turbo run dev --filter=web --filter=api
```

## environment

optional: copy [.env.example](.env.example) to `.env.local` in the repo root or in `apps/web`:

- `NEXT_PUBLIC_API_URL` — default `http://localhost:8000`

## project structure

| Path | Description |
|------|-------------|
| [apps/web](apps/web) | Next.js app — upload UI and RSVP reader |
| [apps/api](apps/api) | FastAPI app — ingest + extract, `GET /content/:id` |
| [apps/docs](apps/docs) | Next.js docs app (for future use) |
| [packages/ui](packages/ui) | shared React components |
| [infra](infra) | Terraform, Ansible, Caddy, k3s — deployment to droplet |

## build

```bash
pnpm build
```

## api-only (python)

```bash
cd apps/api
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

- **endpoints**: `GET /health`, `POST /ingest`, `POST /ingest/text`, `GET /content/{id}`
