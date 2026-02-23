"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import styles from "./upload-page.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const ACCEPT = ".pdf,.docx,.doc,.png,.jpg,.jpeg,.gif,.webp,.tiff,.bmp";

type Status = "idle" | "uploading" | "success" | "error";

export function UploadPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [contentId, setContentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ingestText = useCallback(async (text: string) => {
    setError(null);
    setStatus("uploading");
    try {
      const res = await fetch(`${API_URL}/ingest/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? `Failed: ${res.status}`);
      }
      const data = await res.json();
      setContentId(data.id);
      setStatus("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      setStatus("error");
    }
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    setError(null);
    setStatus("uploading");
    setPastedText("");
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
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
  }, []);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      e.target.value = "";
    },
    [uploadFile]
  );

  const onPaste = useCallback((e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text");
    if (text) setPastedText((prev) => prev + text);
  }, []);

  const startReading = useCallback(() => {
    const trimmed = pastedText.trim();
    if (contentId) {
      window.location.href = `/read?id=${encodeURIComponent(contentId)}`;
      return;
    }
    if (trimmed) ingestText(trimmed);
  }, [contentId, pastedText, ingestText]);

  const hasPastedText = pastedText.trim().length > 0;
  const isReady = status === "success" && contentId;

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Add content to read</h2>
      <p className={styles.hint}>
        Drop a file, paste text (Ctrl+V), or browse. One box, one button.
      </p>

      <div
        className={`${styles.unifiedBox} ${drag ? styles.dragActive : ""} ${status === "uploading" ? styles.uploading : ""}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          onChange={onFileChange}
          disabled={status === "uploading"}
          className={styles.fileInput}
          aria-label="Choose a file"
        />
        <textarea
          className={styles.textarea}
          placeholder="Paste or type text here… or drop a file"
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          onPaste={onPaste}
          disabled={status === "uploading"}
          rows={6}
          aria-label="Paste or type text to speed-read"
        />
        <div className={styles.browseRow}>
          <button
            type="button"
            className={styles.browseButton}
            onClick={() => fileInputRef.current?.click()}
            disabled={status === "uploading"}
          >
            Browse for file
          </button>
        </div>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {isReady ? (
        <Link
          href={`/read?id=${encodeURIComponent(contentId!)}`}
          className={styles.primaryButton}
        >
          Start reading
        </Link>
      ) : (
        <button
          type="button"
          className={styles.primaryButton}
          onClick={startReading}
          disabled={!hasPastedText || status === "uploading"}
        >
          {status === "uploading" ? "Preparing…" : hasPastedText ? "Start reading" : "Paste or add a file first"}
        </button>
      )}
    </div>
  );
}
