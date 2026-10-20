"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { IconButton } from "@/components/ui/button";

export type LightboxImage = { url: string; alt: string };

export function Lightbox({
  images,
  index,
  onClose,
  onIndexChange,
}: {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [loaded, setLoaded] = useState(false);
  const current = images[index];

  const go = useCallback(
    (direction: 1 | -1) => {
      const next = (index + direction + images.length) % images.length;
      setLoaded(false);
      onIndexChange(next);
    },
    [images.length, index, onIndexChange],
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [go, onClose]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="图片查看器"
      style={{ backgroundColor: "var(--overlay)", backdropFilter: "blur(4px)" }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div ref={panelRef} className="relative w-full max-w-5xl">
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={current.url}
            alt={current.alt}
            fill
            sizes="90vw"
            className="object-contain"
            onLoad={() => setLoaded(true)}
            style={{ opacity: loaded ? 1 : 0.4, transition: "opacity 200ms" }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-white/90">
          <span aria-live="polite">
            {current.alt || "图片"} · {index + 1} / {images.length}
          </span>
        </div>
        <IconButton
          ref={closeRef}
          label="关闭图片查看器"
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:bg-white/15 hover:text-white"
        >
          <X size={22} aria-hidden />
        </IconButton>
        {images.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="上一张"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/65"
            >
              <ChevronLeft size={22} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="下一张"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/65"
            >
              <ChevronRight size={22} aria-hidden />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
