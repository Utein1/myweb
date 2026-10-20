import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TagPill } from "@/components/ui/tag-pill";
import { formatDateShort } from "@/lib/format";
import type { PostListItem } from "@/server/queries/posts";

export function PostRow({ post, showSummary = true }: { post: PostListItem; showSummary?: boolean }) {
  return (
    <article className="group border-b border-line last:border-b-0">
      <Link
        href={`/blog/${post.slug}`}
        className="grid gap-2 py-5 transition-colors md:grid-cols-[104px_1fr] md:gap-6 md:py-6"
      >
        <time
          dateTime={post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined}
          className="caption pt-1 font-mono text-muted md:text-[0.75rem]"
        >
          {formatDateShort(post.publishedAt)}
        </time>
        <div>
          <h3 className="flex items-start justify-between gap-4 font-serif text-lg font-medium leading-snug transition-colors group-hover:text-primary">
            <span>{post.title}</span>
            <ArrowRight
              size={16}
              aria-hidden
              className="mt-1.5 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100"
            />
          </h3>
          {showSummary && post.summary ? (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{post.summary}</p>
          ) : null}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <span aria-hidden className="h-1 w-1 rounded-full" style={{ background: "var(--gold)" }} />
              {post.minutes} 分钟
            </span>
            {post.tags.length > 0 ? (
              <span className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <TagPill key={tag.id}>{tag.name}</TagPill>
                ))}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
