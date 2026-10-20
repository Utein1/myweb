import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/site/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";
import { formatDateShort } from "@/lib/format";
import { getArchive } from "@/server/queries/posts";
import { getSiteSettings } from "@/server/queries/site";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata(
    {
      title: "手记归档",
      description: "按月份归档的全部公开手记。",
      path: "/blog/archive",
    },
    {
      siteName: settings.siteName,
      title: settings.defaultSeoTitle,
      description: settings.defaultSeoDesc,
      ogImage: settings.defaultOgImageUrl,
    },
  );
}

export default async function ArchivePage() {
  const archive = await getArchive();
  const total = archive.reduce((sum, bucket) => sum + bucket.posts.length, 0);

  return (
    <div className="container-page py-12 lg:py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink"
      >
        <ArrowLeft size={13} aria-hidden />
        全部手记
      </Link>
      <div className="mt-4">
        <PageHeader
          eyebrow="归档"
          title="手记归档"
          description={`按月份整理，共 ${total} 篇。`}
        />
      </div>

      {archive.length > 0 ? (
        <div className="mt-10 max-w-[820px] space-y-10">
          {archive.map((bucket) => (
            <section key={bucket.key} aria-labelledby={`month-${bucket.key}`}>
              <h2
                id={`month-${bucket.key}`}
                className="flex items-center gap-2 font-serif text-xl font-medium"
              >
                <CalendarDays size={17} aria-hidden style={{ color: "var(--gold)" }} />
                {bucket.label}
                <span className="caption font-normal text-muted">{bucket.posts.length} 篇</span>
              </h2>
              <ul className="mt-3 border-t border-line">
                {bucket.posts.map((post) => (
                  <li key={post.id} className="border-b border-line">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="flex items-center justify-between gap-4 py-3 text-sm transition-colors hover:text-primary"
                    >
                      <span>{post.title}</span>
                      <time
                        dateTime={post.publishedAt?.toISOString()}
                        className="caption shrink-0 font-mono text-muted"
                      >
                        {formatDateShort(post.publishedAt)}
                      </time>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState
            title="归档还是空的"
            description="发布第一篇手记后，这里会按月份自动整理。"
            action={<ButtonLink href="/blog">返回手记</ButtonLink>}
          />
        </div>
      )}
    </div>
  );
}
