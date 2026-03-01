"use client";

import { useEffect } from "react";

export function MouseGlow() {
  useEffect(() => {
    const setPosition = (clientX: number, clientY: number) => {
      document.documentElement.style.setProperty("--mouse-x", `${clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${clientY}px`);
    };

    const onMove = (e: MouseEvent) => setPosition(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) setPosition(touch.clientX, touch.clientY);
    };

    setPosition(window.innerWidth / 2, window.innerHeight / 2);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  return null;
}
