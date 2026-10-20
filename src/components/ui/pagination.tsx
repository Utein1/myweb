import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function buildHref(basePath: string, params: Record<string, string | undefined>, page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && key !== "page") search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function Pagination({
  basePath,
  page,
  totalPages,
  params = {},
}: {
  basePath: string;
  page: number;
  totalPages: number;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (item) => item === 1 || item === totalPages || Math.abs(item - page) <= 1,
  );

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="分页">
      {page > 1 ? (
        <Link
          href={buildHref(basePath, params, page - 1)}
          className="inline-flex h-10 items-center gap-1 rounded-[8px] border border-line px-3 text-sm hover:border-line-strong"
          rel="prev"
        >
          <ChevronLeft size={15} aria-hidden /> 上一页
        </Link>
      ) : (
        <span className="inline-flex h-10 items-center gap-1 rounded-[8px] border border-line px-3 text-sm text-muted opacity-50">
          <ChevronLeft size={15} aria-hidden /> 上一页
        </span>
      )}

      {pages.map((item, index) => {
        const previous = pages[index - 1];
        return (
          <span key={item} className="flex items-center gap-2">
            {previous && item - previous > 1 ? <span className="text-muted">…</span> : null}
            <Link
              href={buildHref(basePath, params, item)}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "inline-flex h-10 min-w-10 items-center justify-center rounded-[8px] border px-2 text-sm",
                item === page
                  ? "border-transparent bg-primary font-medium text-[color:var(--primary-contrast)]"
                  : "border-line hover:border-line-strong",
              )}
            >
              {item}
            </Link>
          </span>
        );
      })}

      {page < totalPages ? (
        <Link
          href={buildHref(basePath, params, page + 1)}
          className="inline-flex h-10 items-center gap-1 rounded-[8px] border border-line px-3 text-sm hover:border-line-strong"
          rel="next"
        >
          下一页 <ChevronRight size={15} aria-hidden />
        </Link>
      ) : (
        <span className="inline-flex h-10 items-center gap-1 rounded-[8px] border border-line px-3 text-sm text-muted opacity-50">
          下一页 <ChevronRight size={15} aria-hidden />
        </span>
      )}
    </nav>
  );
}
