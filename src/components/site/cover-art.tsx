import Image from "next/image";
import { cn } from "@/lib/utils";

/** 封面：有图用图，无图用主题色块 + 首字兜底（避免破图与布局偏移） */
export function CoverArt({
  src,
  alt,
  title,
  className,
  priority = false,
  sizes = "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw",
}: {
  src?: string | null;
  alt?: string;
  title: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (src) {
    return (
      <div className={cn("cover-frame", className)}>
        <Image
          src={src}
          alt={alt ?? title}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn("cover-frame relative flex items-center justify-center overflow-hidden", className)}
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, var(--surface-2)), var(--surface-2) 55%, color-mix(in srgb, var(--gold) 14%, var(--surface)))",
      }}
      aria-hidden={!alt}
      role={alt ? "img" : undefined}
      aria-label={alt}
    >
      <svg
        viewBox="0 0 200 120"
        className="absolute inset-0 h-full w-full"
        aria-hidden
        style={{ opacity: 0.35 }}
      >
        <circle cx="160" cy="22" r="46" fill="none" stroke="var(--gold)" strokeOpacity="0.5" />
        <circle cx="160" cy="22" r="32" fill="none" stroke="var(--primary)" strokeOpacity="0.35" strokeDasharray="2 6" />
        <path d="M10 104 L70 16 L130 104" fill="none" stroke="var(--primary)" strokeOpacity="0.25" />
        <path d="M0 118 H200" stroke="var(--gold)" strokeOpacity="0.3" />
      </svg>
      <span
        className="relative font-serif"
        style={{ fontSize: "2.75rem", color: "var(--gold)", opacity: 0.9 }}
      >
        {title.slice(0, 1)}
      </span>
    </div>
  );
}
