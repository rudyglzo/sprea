"use client";

import { useEffect, useState } from "react";
import styles from "./theme-toggle.module.css";

const STORAGE_KEY = "sprea-theme";

type Theme = "light" | "dark" | "system";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getEffectiveTheme(stored: Theme | null): "light" | "dark" {
  if (stored === "light") return "light";
  if (stored === "dark") return "dark";
  return getSystemTheme();
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    setTheme(stored || "system");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const effective = getEffectiveTheme(theme);
    document.documentElement.setAttribute("data-theme", effective);
  }, [theme, mounted]);

  const cycle = () => {
    const next: Theme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  if (!mounted) return <span className={styles.toggle} aria-hidden />;

  const label =
    theme === "light" ? "Light mode" : theme === "dark" ? "Dark mode" : "System (auto)";

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={cycle}
      aria-label={`Theme: ${label}. Click to cycle.`}
      title={label}
    >
      {theme === "light" && "☀"}
      {theme === "dark" && "☽"}
      {theme === "system" && "◐"}
    </button>
  );
}
