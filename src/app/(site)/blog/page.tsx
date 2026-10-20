import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Pin, Rss, Search, X } from "lucide-react";
import { CoverArt } from "@/components/site/cover-art";
import { PageHeader } from "@/components/site/section-heading";
import { PostRow } from "@/components/site/post-row";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import { TagPill } from "@/components/ui/tag-pill";
import { buildMetadata } from "@/lib/seo";
import { formatDateShort } from "@/lib/format";
import {
  getPinnedPosts,
  getPublishedPosts,
  getPublishedTags,
} from "@/server/queries/posts";
import { getSiteSettings } from "@/server/queries/site";

export const revalidate = 300;

type SearchParams = Promise<{ page?: string; tag?: string; q?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const settings = await getSiteSettings();
  const params = await searchParams;
  return buildMetadata(
    {
      title: params.tag ? `手记 · ${params.tag}` : "手记",
      description: "关于工程实践、设计、长期维护与阅读的零散记录。",
      path: "/blog",
    },
    {
      siteName: settings.siteName,
      title: settings.defaultSeoTitle,
      description: settings.defaultSeoDesc,
      ogImage: settings.defaultOgImageUrl,
    },
  );
}

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const pageNumber = Number(params.page ?? "1");
  const page = Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1;

  const [data, pinned, tags] = await Promise.all([
    getPublishedPosts({ page, tag: params.tag, q: params.q }),
    page === 1 && !params.tag && !params.q ? getPinnedPosts(2) : Promise.resolve([]),
    getPublishedTags(),
  ]);

  if (data.total > 0 && page > data.totalPages) notFound();

  const pinnedIds = new Set(pinned.map((post) => post.id));
  const listItems = page === 1 ? data.items.filter((post) => !pinnedIds.has(post.id)) : data.items;
  const hasFilters = Boolean(params.tag || params.q);

  return (
    <div className="container-page py-12 lg:py-16">
      <PageHeader
        eyebrow="手记"
        title="手记"
        description="关于工程实践、设计、长期维护与阅读的零散记录。"
      >
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
          <span>
            共 <strong className="font-medium text-ink">{data.total}</strong> 篇手记
          </span>
          <a href="/rss.xml" className="inline-flex items-center gap-1.5 hover:text-ink">
            <Rss size={14} aria-hidden />
            订阅 RSS
          </a>
          {hasFilters ? (
            <Link href="/blog" className="inline-flex items-center gap-1 hover:text-ink">
              <X size={13} aria-hidden />
              清除筛选
            </Link>
          ) : null}
        </div>
      </PageHeader>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_260px]">
        <div>
          {/* 移动端标签 */}
          {tags.length > 0 ? (
            <details className="mb-6 rounded-[12px] border border-line bg-surface px-4 py-3 lg:hidden">
              <summary className="cursor-pointer text-sm font-medium">按标签浏览</summary>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <TagPill
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}`}
                    className={params.tag === tag.slug ? "border-transparent bg-primary-soft text-primary" : ""}
                  >
                    {tag.name} · {tag.count}
                  </TagPill>
                ))}
              </div>
            </details>
          ) : null}

          {/* 置顶 */}
          {pinned.length > 0 ? (
            <section aria-labelledby="pinned-title" className="mb-10">
              <h2 id="pinned-title" className="caption mb-3 flex items-center gap-1.5 text-muted">
                <Pin size={13} aria-hidden />
                置顶手记
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {pinned.map((post) => (
                  <article key={post.id}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-[12px] border border-line bg-surface transition-colors hover:border-line-strong"
                    >
                      <CoverArt src={post.coverUrl} title={post.title} sizes="(min-width: 768px) 40vw, 92vw" className="rounded-none border-0 border-b border-line" />
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-center justify-between gap-2 text-xs text-muted">
                          <time dateTime={post.publishedAt?.toISOString()}>
                            {formatDateShort(post.publishedAt)}
                          </time>
                          <span style={{ color: "var(--gold)" }} className="inline-flex items-center gap-1">
                            <Pin size={12} aria-hidden />
                            置顶
                          </span>
                        </div>
                        <h3 className="mt-2 font-serif text-xl font-medium leading-snug group-hover:text-primary">
                          {post.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                          {post.summary}
                        </p>
                        <p className="caption mt-auto pt-4 text-muted">{post.minutes} 分钟读完</p>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {/* 搜索 */}
          <form action="/blog" method="get" className="mb-4 flex items-center gap-2">
            {params.tag ? <input type="hidden" name="tag" value={params.tag} /> : null}
            <div className="relative flex-1">
              <Search
                size={15}
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <Input
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="搜索标题或正文"
                aria-label="搜索手记"
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              搜索
            </Button>
          </form>

          {params.tag ? (
            <p className="mb-2 text-sm text-muted">
              当前标签：<span className="text-ink">#{params.tag}</span>
            </p>
          ) : null}

          {/* 列表 */}
          {listItems.length > 0 ? (
            <div className="border-t border-line">
              {listItems.map((post) => (
                <PostRow key={post.id} post={post} />
              ))}
            </div>
          ) : data.total === 0 ? (
            <EmptyState
              icon={<BookOpen size={40} />}
              title="没有找到手记"
              description={hasFilters ? "换个关键词或标签试试。" : "第一篇手记正在撰写中。"}
              action={
                hasFilters ? (
                  <ButtonLink href="/blog" variant="secondary">
                    清除筛选
                  </ButtonLink>
                ) : null
              }
            />
          ) : null}

          <Pagination
            basePath="/blog"
            page={data.page}
            totalPages={data.totalPages}
            params={{ tag: params.tag, q: params.q }}
          />
        </div>

        {/* 侧边栏 */}
        <aside className="hidden lg:block" aria-label="手记侧边栏">
          <div className="sticky top-24 space-y-8">
            <section>
              <h2 className="caption mb-3 text-muted">标签</h2>
              {tags.length > 0 ? (
                <ul className="space-y-1">
                  {tags.map((tag) => (
                    <li key={tag.id}>
                      <Link
                        href={`/blog?tag=${tag.slug}`}
                        aria-current={params.tag === tag.slug ? "true" : undefined}
                        className="flex h-9 items-center justify-between rounded-[6px] px-2 text-sm text-muted transition-colors hover:bg-primary-soft hover:text-ink"
                      >
                        <span>#{tag.name}</span>
                        <span className="caption font-mono opacity-60">{tag.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">暂无标签</p>
              )}
            </section>

            <section className="border-t border-line pt-6">
              <h2 className="caption mb-3 text-muted">归档</h2>
              <Link href="/blog/archive" className="text-sm text-muted hover:text-ink">
                按月份查看全部手记 →
              </Link>
            </section>

            <section className="border-t border-line pt-6">
              <h2 className="caption mb-3 text-muted">订阅</h2>
              <a
                href="/rss.xml"
                className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
              >
                <Rss size={15} aria-hidden />
                RSS
              </a>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
