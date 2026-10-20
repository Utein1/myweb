"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/markdown";
import { cn } from "@/lib/utils";

export function TableOfContents({
  items,
  className,
  title = "目录",
}: {
  items: TocItem[];
  className?: string;
  title?: string;
}) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const key = items.map((item) => item.id).join("|");

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: 0 },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="文章目录" className={cn("text-sm", className)}>
      <p className="caption mb-2 text-muted">{title}</p>
      <ul className="max-h-[calc(100vh-200px)] space-y-1 overflow-y-auto border-l border-line pl-3">
        {items.map((item) => (
          <li key={item.id} className={item.depth === 3 ? "pl-3" : undefined}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={cn(
                "-ml-[13px] block border-l-2 py-1 pl-3 transition-colors",
                active === item.id
                  ? "border-primary font-medium text-ink"
                  : "border-transparent text-muted hover:text-ink",
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function MobileToc({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;
  return (
    <details className="mb-6 rounded-[12px] border border-line bg-surface px-4 py-3 lg:hidden">
      <summary className="cursor-pointer text-sm font-medium">目录（{items.length}）</summary>
      <ul className="mt-3 space-y-1.5 border-l border-line pl-3 text-sm">
        {items.map((item) => (
          <li key={item.id} className={item.depth === 3 ? "pl-3" : undefined}>
            <a href={`#${item.id}`} className="block py-0.5 text-muted hover:text-ink">
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
