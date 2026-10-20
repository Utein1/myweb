"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { IconButton } from "@/components/ui/button";

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // 隐私模式下忽略
    }
    setDark(next);
  }

  return (
    <IconButton
      label={dark ? "切换到浅色模式" : "切换到深色模式"}
      onClick={toggle}
      aria-pressed={dark ?? false}
    >
      <span className="relative inline-flex h-5 w-5 items-center justify-center">
        <Sun
          size={18}
          aria-hidden
          className="absolute transition-all duration-300"
          style={{ opacity: dark === null || dark ? 0 : 1, transform: dark ? "rotate(-90deg)" : "none" }}
        />
        <Moon
          size={18}
          aria-hidden
          className="absolute transition-all duration-300"
          style={{ opacity: dark ? 1 : 0, transform: dark ? "none" : "rotate(90deg)" }}
        />
      </span>
    </IconButton>
  );
}
