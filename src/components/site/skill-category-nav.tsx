"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function SkillCategoryNav({
  categories,
}: {
  categories: { slug: string; name: string; count: number }[];
}) {
  const [active, setActive] = useState(categories[0]?.slug ?? "");

  useEffect(() => {
    const sections = categories
      .map((category) => document.getElementById(category.slug))
      .filter((element): element is HTMLElement => Boolean(element));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0.3 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [categories]);

  return (
    <div className="sticky top-[68px] z-20 -mx-5 border-y border-line bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] px-5 backdrop-blur-md sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-[12px] lg:border lg:px-3">
      <nav aria-label="技能分类" className="-mx-1 flex gap-1 overflow-x-auto py-2">
        {categories.map((category) => (
          <a
            key={category.slug}
            href={`#${category.slug}`}
            aria-current={active === category.slug ? "true" : undefined}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-2 rounded-[8px] px-3 text-sm transition-colors",
              active === category.slug
                ? "bg-primary-soft font-medium text-primary"
                : "text-muted hover:bg-primary-soft hover:text-ink",
            )}
          >
            {category.name}
            <span className="caption opacity-60">{category.count}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
