"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./animated-text.module.css";

type Props = {
  /** Space-separated text (used when words not provided) */
  text?: string;
  /** Words to cycle through in order; when finished, restarts at first */
  words?: string[];
  className?: string;
  delay?: number;
  as?: "span" | "p";
  /** RSVP mode: one word at a time, cycling */
  cycle?: boolean;
  /** Alignment when cycling: center (default) or left */
  align?: "center" | "left";
  /** Different color per word */
  rgb?: boolean;
};

const WORD_DURATION_MS = 750;

const WORD_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];

export function AnimatedText({ text = "", words: wordsProp, className = "", delay = 0, as: Tag = "span", cycle = false, align = "center", rgb = false }: Props) {
  const words = useMemo(() => (wordsProp ?? text.split(" ")).filter(Boolean), [wordsProp, text]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!cycle || words.length === 0) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, WORD_DURATION_MS);
    return () => clearInterval(id);
  }, [cycle, words.length]);

  if (cycle && words.length > 0) {
    const word = words[index];
    return (
      <Tag
        className={`${styles.wrapper} ${styles.cycleWrapper} ${styles.cycleSingle} ${align === "left" ? styles.cycleLeft : ""} ${className}`}
      >
        <span
          key={index}
          className={styles.cycleWord}
          style={rgb ? { color: WORD_COLORS[index % WORD_COLORS.length] } : undefined}
        >
          {word}
        </span>
      </Tag>
    );
  }

  return (
    <Tag className={`${styles.wrapper} ${className}`}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className={styles.word}
          style={{ animationDelay: `${delay + i * 0.12}s` }}
        >
          {word}
          {i < words.length - 1 ? "\u00A0" : null}
        </span>
      ))}
    </Tag>
  );
}
