# Sprea Docker

## Local

```bash
docker compose up --build
```

Open http://localhost:3000

## Deploy

### Option A: Build on droplet

```bash
rsync -avz --exclude node_modules --exclude .git --exclude .turbo --exclude apps/api/.venv \
  . root@YOUR_IP:/root/sprea/
```

On droplet: create `.env` with `NEXT_PUBLIC_API_URL` and `CORS_ORIGINS`, then `docker compose up --build -d`.

### Option B: Registry

Build, tag, push. On droplet: `.env` + `docker compose pull && docker compose up -d`.

## Notes

- `NEXT_PUBLIC_API_URL` is baked in at build time — rebuild web after changing.
- CORS: set `CORS_ORIGINS` to your web origin (e.g. `https://yourdomain.com`).
- API needs tesseract; the Dockerfile installs it.
