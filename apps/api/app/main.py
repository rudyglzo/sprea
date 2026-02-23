from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.extract import extract_text
from app.store import content_store

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".tiff", ".bmp"}


def get_ext(filename: str) -> str:
    if "." in filename:
        return "." + filename.rsplit(".", 1)[-1].lower()
    return ""


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    content_store.clear()


app = FastAPI(
    title="Sprea API",
    description="Document ingestion and text extraction for Sprea",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ingest")
async def ingest(file: UploadFile = File(...)):
    ext = get_ext(file.filename or "")
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )
    content_id = str(uuid4())
    raw = await file.read()
    try:
        text = extract_text(raw, ext, file.content_type or "")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Extraction failed: {str(e)}")
    content_store.set(content_id, {"text": text, "filename": file.filename or "document"})
    return {"id": content_id, "status": "ready", "text": text, "filename": file.filename}


@app.get("/content/{content_id}")
def get_content(content_id: str):
    data = content_store.get(content_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Content not found")
    return data
