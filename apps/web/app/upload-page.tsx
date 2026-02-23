"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import styles from "./upload-page.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const ACCEPT = ".pdf,.docx,.doc,.png,.jpg,.jpeg,.gif,.webp,.tiff,.bmp";

type Status = "idle" | "uploading" | "success" | "error";

export function UploadPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [contentId, setContentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const upload = useCallback(async (file: File) => {
    setError(null);
    setStatus("uploading");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(`${API_URL}/ingest`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? `Upload failed: ${res.status}`);
      }
      const data = await res.json();
      setContentId(data.id);
      setStatus("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setStatus("error");
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDrag(false);
      const file = e.dataTransfer.files[0];
      if (file) upload(file);
    },
    [upload]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
  }, []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) upload(file);
      e.target.value = "";
    },
    [upload]
  );

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Upload a document</h2>
      <p className={styles.hint}>
        PDF, DOCX, or images. We extract text so you can speed-read it.
      </p>

      <div
        className={`${styles.dropzone} ${drag ? styles.dragActive : ""} ${status === "uploading" ? styles.uploading : ""}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        aria-describedby="dropzone-hint"
      >
        <input
          id="file-input"
          type="file"
          accept={ACCEPT}
          onChange={onInputChange}
          disabled={status === "uploading"}
          className={styles.input}
          aria-label="Choose a file to upload"
        />
        <label htmlFor="file-input" className={styles.label}>
          {status === "uploading" ? (
            "Extracting text…"
          ) : (
            <>
              Drag and drop here, or <span className={styles.browse}>browse</span>
            </>
          )}
        </label>
        <p id="dropzone-hint" className={styles.srOnly}>
          Accepted: PDF, DOCX, DOC, PNG, JPG, GIF, WebP, TIFF, BMP
        </p>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {status === "success" && contentId && (
        <div className={styles.success} role="status">
          <p>Ready to read.</p>
          <Link
            href={`/read?id=${encodeURIComponent(contentId)}`}
            className={styles.primaryButton}
          >
            Start reading
          </Link>
        </div>
      )}
    </div>
  );
}
