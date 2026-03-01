"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./reader-page.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const WPM_STORAGE_KEY = "sprea-reader-wpm";
const DEFAULT_WPM = 300;
const MIN_WPM = 50;
const MAX_WPM = 1000;
const WPM_STEP = 10;

function getWords(text: string): string[] {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function ReaderPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const [id, setId] = useState<string | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [wpm, setWpm] = useState(DEFAULT_WPM);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "empty">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    searchParams.then((p) => p.id && setId(p.id));
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(WPM_STORAGE_KEY);
      if (stored) {
        const n = parseInt(stored, 10);
        if (!Number.isNaN(n) && n >= MIN_WPM && n <= MAX_WPM) setWpm(n);
      }
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setStatus("empty");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    setError(null);
    fetch(`${API_URL}/content/${encodeURIComponent(id)}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "Content not found" : "Failed to load");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const text = data.text ?? "";
        const list = getWords(text);
        setWords(list);
        setIndex(0);
        setStatus(list.length ? "ready" : "empty");
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
          setStatus("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!playing || words.length === 0 || index >= words.length - 1) {
      if (index >= words.length - 1 && words.length > 0) setPlaying(false);
      return;
    }
    const delay = 60_000 / wpm;
    const t = setTimeout(() => setIndex((i) => Math.min(i + 1, words.length - 1)), delay);
    return () => clearTimeout(t);
  }, [playing, index, words.length, wpm]);

  const togglePlay = useCallback(() => {
    if (words.length === 0) return;
    if (index >= words.length - 1) setIndex(0);
    setPlaying((p) => !p);
  }, [words.length, index]);

  const restart = useCallback(() => {
    setIndex(0);
    setPlaying(true);
  }, []);

  const persistWpm = useCallback((value: number) => {
    setWpm(value);
    if (typeof window !== "undefined") localStorage.setItem(WPM_STORAGE_KEY, String(value));
  }, []);

  const displayIndex = Math.min(index, words.length - 1);
  const currentWord = useMemo(() => (words[displayIndex] ?? "").trim(), [words, displayIndex]);
  const progress = words.length ? Math.round(((displayIndex + 1) / words.length) * 100) : 0;

  if (status === "empty" && !id) {
    return (
      <div className={styles.container}>
        <p className={styles.message}>no document selected.</p>
        <Link href="/" className={styles.backLink}>
          upload a document
        </Link>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className={styles.container}>
        <p className={styles.message}>loading…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={styles.container}>
        <p className={styles.error} role="alert">
          {error}
        </p>
        <Link href="/" className={styles.backLink}>
          back to upload
        </Link>
      </div>
    );
  }

  if (status === "empty" || words.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.message}>no text to display.</p>
        <Link href="/" className={styles.backLink}>
          upload another document
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.controls}>
          <div className={styles.controlsLeft}>
            <Link href="/" className={styles.backLink}>
              ← sprea
            </Link>
          </div>
          <div className={styles.controlsCenter}>
            <div className={styles.speedControls}>
              <label className={styles.wpmLabel}>
                <span className={styles.wpmText}>speed (wpm)</span>
                <input
                  type="range"
                  min={MIN_WPM}
                  max={MAX_WPM}
                  step={WPM_STEP}
                  value={wpm}
                  onChange={(e) => persistWpm(Number(e.target.value))}
                  className={styles.slider}
                  aria-label="Words per minute"
                />
                <span className={styles.wpmValue} aria-live="polite">
                  {wpm}
                </span>
              </label>
              <div className={styles.speedPresets}>
                <button
                  type="button"
                  className={`${styles.speedPreset} ${styles.speedPresetSlow}`}
                  onClick={() => persistWpm(150)}
                >
                  slow
                </button>
                <button
                  type="button"
                  className={`${styles.speedPreset} ${styles.speedPresetNormal}`}
                  onClick={() => persistWpm(300)}
                >
                  normal
                </button>
                <button
                  type="button"
                  className={`${styles.speedPreset} ${styles.speedPresetFast}`}
                  onClick={() => persistWpm(500)}
                >
                  fast
                </button>
                <button
                  type="button"
                  className={`${styles.speedPreset} ${styles.speedPresetTurbo}`}
                  onClick={() => persistWpm(800)}
                >
                  turbo
                </button>
              </div>
            </div>
          </div>
          <div className={styles.controlsRight}>
            <button
              type="button"
              onClick={restart}
              className={styles.secondaryButton}
              aria-label="Restart from beginning"
            >
              restart
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className={styles.primaryButton}
              aria-label={playing ? "Pause" : "Play"}
              aria-pressed={playing}
            >
              {playing ? "pause" : "play"}
            </button>
          </div>
        </div>
        <p className={styles.progress} aria-live="polite">
          {displayIndex + 1} / {words.length} · {Math.min(progress, 100)}%
        </p>
      </header>

      <div className={styles.reader} onClick={togglePlay}>
        <p className={styles.word} aria-live="polite" aria-atomic="true">
          {currentWord}
        </p>
      </div>
    </div>
  );
}
