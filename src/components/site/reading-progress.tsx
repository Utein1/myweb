"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function update() {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(height > window.innerHeight * 2);
      setProgress(height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="top-progress no-print"
      role="progressbar"
      aria-label="阅读进度"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      style={{ transform: `scaleX(${progress})` }}
    />
  );
}
