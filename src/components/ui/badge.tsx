import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/constants";

const tones: Record<Tone, { style: React.CSSProperties; className: string }> = {
  primary: {
    style: {
      backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)",
      color: "var(--primary)",
    },
    className: "border border-transparent",
  },
  success: {
    style: {
      backgroundColor: "color-mix(in srgb, var(--success) 12%, transparent)",
      color: "var(--success)",
    },
    className: "border border-transparent",
  },
  warning: {
    style: {
      backgroundColor: "color-mix(in srgb, var(--warning) 13%, transparent)",
      color: "var(--warning)",
    },
    className: "border border-transparent",
  },
  muted: {
    style: { backgroundColor: "var(--surface-2)", color: "var(--text-muted)" },
    className: "border border-line",
  },
  dashed: {
    style: { backgroundColor: "transparent", color: "var(--text-muted)" },
    className: "border border-dashed border-line-strong",
  },
  danger: {
    style: {
      backgroundColor: "color-mix(in srgb, var(--danger) 12%, transparent)",
      color: "var(--danger)",
    },
    className: "border border-transparent",
  },
};

export function Badge({
  tone = "muted",
  children,
  dot = false,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  const config = tones[tone];
  return (
    <span
      className={cn(
        "caption inline-flex h-6 items-center gap-1.5 rounded-full px-2.5",
        config.className,
        className,
      )}
      style={config.style}
    >
      {dot ? (
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: "currentColor" }}
        />
      ) : null}
      {children}
    </span>
  );
}
