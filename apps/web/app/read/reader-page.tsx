"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./reader-page.module.css";

const GRANTED_ID_KEY = "sprea-granted-id";

function RewindIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11 18V6l-8 6 8 6zm9-12v12l-8-6 8-6z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </svg>
  );
}

function ForwardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 18l8-6-8-6v12zm9-12v12l8-6-8-6z" />
    </svg>
  );
}

function RestartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const WPM_STORAGE_KEY = "sprea-reader-wpm";
const DEFAULT_WPM = 300;
const MIN_WPM = 50;
const MAX_WPM = 1000;
const WPM_STEP = 10;
const REWIND_WORDS = 5;

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
  const router = useRouter();
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
    if (typeof window === "undefined" || !id) return;
    const granted = sessionStorage.getItem(GRANTED_ID_KEY);
    if (granted !== id) {
      router.replace("/");
    }
  }, [id, router]);

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

  const rewind = useCallback(() => {
    setIndex((i) => Math.max(0, i - REWIND_WORDS));
  }, []);

  const forward = useCallback(() => {
    setIndex((i) => Math.min(words.length - 1, i + REWIND_WORDS));
  }, [words.length]);

  const seekTo = useCallback((wordIndex: number) => {
    setIndex(Math.max(0, Math.min(wordIndex, words.length - 1)));
  }, [words.length]);

  const persistWpm = useCallback((value: number) => {
    setWpm(value);
    if (typeof window !== "undefined") localStorage.setItem(WPM_STORAGE_KEY, String(value));
  }, []);

  const displayIndex = Math.min(index, words.length - 1);
  const currentWord = useMemo(() => (words[displayIndex] ?? "").trim(), [words, displayIndex]);

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
        <Link href="/" className={styles.backLink}>
          ← sprea
        </Link>
      </header>

      <div className={styles.reader} onClick={togglePlay}>
        <p className={styles.word} aria-live="polite" aria-atomic="true">
          {currentWord}
        </p>
      </div>

      <div className={styles.controlBar}>
        <div className={styles.seekRow}>
          <div
            className={styles.seekBarWrap}
            style={
              {
                "--seek-progress": words.length > 1 ? (displayIndex / (words.length - 1)) * 100 : 0,
              } as React.CSSProperties
            }
          >
            <input
              type="range"
              min={0}
              max={Math.max(0, words.length - 1)}
              value={displayIndex}
              onChange={(e) => seekTo(Number(e.target.value))}
              className={styles.seekBar}
              aria-label="Seek through words"
            />
          </div>
          <span className={styles.wordCount} aria-live="polite">
            {displayIndex + 1} / {words.length}
          </span>
        </div>
        <div className={styles.controlRow}>
          <button
            type="button"
            onClick={restart}
            className={styles.iconButton}
            aria-label="Restart from beginning"
          >
            <RestartIcon />
          </button>
          <div className={styles.transportBar}>
            <button
              type="button"
              onClick={rewind}
              className={styles.iconButton}
              aria-label={`Back ${REWIND_WORDS} words`}
              disabled={index === 0}
            >
              <RewindIcon />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className={`${styles.iconButton} ${styles.playButton}`}
              aria-label={playing ? "Pause" : "Play"}
              aria-pressed={playing}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              type="button"
              onClick={forward}
              className={styles.iconButton}
              aria-label={`Forward ${REWIND_WORDS} words`}
              disabled={index >= words.length - 1}
            >
              <ForwardIcon />
            </button>
          </div>
          <div className={styles.speedControls}>
            <div className={styles.speedHeader}>
              <span className={styles.speedLabel}>speed</span>
              <span className={styles.wpmValue} aria-live="polite">
                {wpm} wpm
              </span>
            </div>
            <div className={styles.speedPresets}>
              <button
                type="button"
                className={`${styles.speedPreset} ${wpm <= 175 ? styles.speedPresetActive : ""} ${styles.speedPresetSlow}`}
                onClick={() => persistWpm(150)}
                title="150 wpm"
              >
                slow
              </button>
              <button
                type="button"
                className={`${styles.speedPreset} ${wpm > 175 && wpm <= 400 ? styles.speedPresetActive : ""} ${styles.speedPresetNormal}`}
                onClick={() => persistWpm(300)}
                title="300 wpm"
              >
                normal
              </button>
              <button
                type="button"
                className={`${styles.speedPreset} ${wpm > 400 && wpm <= 650 ? styles.speedPresetActive : ""} ${styles.speedPresetFast}`}
                onClick={() => persistWpm(500)}
                title="500 wpm"
              >
                fast
              </button>
              <button
                type="button"
                className={`${styles.speedPreset} ${wpm > 650 ? styles.speedPresetActive : ""} ${styles.speedPresetTurbo}`}
                onClick={() => persistWpm(800)}
                title="800 wpm"
              >
                turbo
              </button>
            </div>
            <input
              type="range"
              min={MIN_WPM}
              max={MAX_WPM}
              step={WPM_STEP}
              value={wpm}
              onChange={(e) => persistWpm(Number(e.target.value))}
              className={styles.wpmSlider}
              aria-label="Words per minute"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
