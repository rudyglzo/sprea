"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import styles from "./upload-page.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const ACCEPT = ".pdf,.docx,.doc,.png,.jpg,.jpeg,.gif,.webp,.tiff,.bmp";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

type Status = "idle" | "uploading" | "success" | "error";

export function UploadPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [contentId, setContentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigateToRead = useCallback(
    (id: string) => {
      router.push(`/read?id=${encodeURIComponent(id)}`);
    },
    [router]
  );

  const ingestText = useCallback(
    async (text: string) => {
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
        navigateToRead(data.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
        setStatus("error");
      }
    },
    [navigateToRead]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      if (file.size > MAX_FILE_SIZE) {
        setError(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
        return;
      }
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
        navigateToRead(data.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
        setStatus("error");
      }
    },
    [navigateToRead]
  );

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

  const startReading = useCallback(() => {
    const trimmed = pastedText.trim();
    if (trimmed) ingestText(trimmed);
  }, [pastedText, ingestText]);

  const hasPastedText = pastedText.trim().length > 0;

  return (
    <div className={styles.wrapper}>
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
          tabIndex={-1}
        />
        <div className={styles.textareaWrap}>
          {!pastedText && (
            <div className={styles.placeholderOverlay} aria-hidden>
              <span className={styles.placeholderText}>paste text or drop a file</span>
            </div>
          )}
          <textarea
            className={styles.textarea}
            placeholder=" "
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            disabled={status === "uploading"}
            rows={19}
            aria-label="Paste or type text to speed-read"
          />
        </div>
        <div className={styles.row}>
          <button
            type="button"
            className={styles.browseButton}
            onClick={() => fileInputRef.current?.click()}
            disabled={status === "uploading"}
          >
            browse
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={startReading}
            disabled={!hasPastedText || status === "uploading"}
          >
            {status === "uploading" ? "preparing…" : hasPastedText ? "start reading" : "add content first"}
          </button>
        </div>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

