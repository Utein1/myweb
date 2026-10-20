import { cn } from "@/lib/utils";

/** 徽记：自创几何图形（法阵式圆环 + 书页菱形），不使用任何受版权保护的素材 */
export function Emblem({
  size = 72,
  className,
  title,
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id="emblem-gold" x1="24" y1="16" x2="72" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--gold)" />
          <stop offset="1" stopColor="var(--primary)" />
        </linearGradient>
      </defs>
      <circle cx="48" cy="48" r="44" fill="none" stroke="var(--gold)" strokeOpacity="0.5" />
      <circle
        cx="48"
        cy="48"
        r="36"
        fill="none"
        stroke="var(--gold)"
        strokeOpacity="0.32"
        strokeDasharray="1.5 7"
        strokeLinecap="round"
      />
      <path
        d="M48 9 L81 48 L48 87 L15 48 Z"
        fill="none"
        stroke="url(#emblem-gold)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M48 22 L67 48 L48 74 L29 48 Z"
        fill="none"
        stroke="var(--primary)"
        strokeOpacity="0.55"
        strokeLinejoin="round"
      />
      <path
        d="M48 34 L57.5 48 L48 62 L38.5 48 Z"
        fill="var(--primary)"
        fillOpacity="0.14"
        stroke="var(--primary)"
        strokeOpacity="0.8"
        strokeLinejoin="round"
      />
      <path d="M48 9 V22 M48 74 V87 M15 48 H29 M67 48 H81" stroke="var(--gold)" strokeOpacity="0.45" />
      <circle cx="48" cy="48" r="2.6" fill="var(--gold)" />
      <circle cx="48" cy="48" r="8" fill="none" stroke="var(--gold)" strokeOpacity="0.35" />
    </svg>
  );
}
