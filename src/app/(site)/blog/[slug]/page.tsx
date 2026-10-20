import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, FileText } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { TagPill } from "@/components/ui/tag-pill";
import { CoverArt } from "@/components/site/cover-art";
import { JsonLd } from "@/components/site/json-ld";
import { PostRow } from "@/components/site/post-row";
import { Prose } from "@/components/site/prose";
import { ReadingProgress } from "@/components/site/reading-progress";
import { ShareButton } from "@/components/site/share-button";
import { TableOfContents, MobileToc } from "@/components/site/toc";
import { buildMetadata } from "@/lib/seo";
import { formatDate, formatDateShort } from "@/lib/format";
import { absoluteUrl } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";
import {
  getAdjacentPosts,
  getPostBySlug,
  getRelatedPosts,
} from "@/server/queries/posts";
import { getProfile, getSiteSettings } from "@/server/queries/site";

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPostBySlug(slug), getSiteSettings()]);
  if (!post) return { title: "手记不存在" };
  return buildMetadata(
    {
      title: post.seoTitle || post.title,
      description: post.seoDesc || post.summary || undefined,
      path: `/blog/${post.slug}`,
      image: post.coverUrl,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    },
    {
      siteName: settings.siteName,
      title: settings.defaultSeoTitle,
      description: settings.defaultSeoDesc,
      ogImage: settings.defaultOgImageUrl,
    },
  );
}

export default async function PostDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [{ html, toc, minutes }, { newer, older }, related, profile, settings] = await Promise.all([
    renderMarkdown(post.content),
    getAdjacentPosts(post.id),
    getRelatedPosts(
      post.id,
      post.tags.map((item) => item.tagId),
      3,
    ),
    getProfile(),
    getSiteSettings(),
  ]);

  const updated =
    post.updatedAt.getTime() - (post.publishedAt?.getTime() ?? 0) > 24 * 60 * 60 * 1000;

  return (
    <>
      <ReadingProgress />
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.summary || undefined,
            datePublished: post.publishedAt?.toISOString(),
            dateModified: post.updatedAt.toISOString(),
            author: { "@type": "Person", name: profile?.displayName ?? settings.siteName },
            publisher: { "@type": "Organization", name: settings.siteName },
            mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
            image: post.coverUrl ? absoluteUrl(post.coverUrl) : undefined,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "手记", item: absoluteUrl("/blog") },
              {
                "@type": "ListItem",
                position: 2,
                name: post.title,
                item: absoluteUrl(`/blog/${post.slug}`),
              },
            ],
          },
        ]}
      />

      <div id="top" className="container-page py-10 lg:py-14">
        <div className="mx-auto max-w-[1080px]">
          <div className="flex items-center justify-between gap-4">
            <Breadcrumb
              items={[{ label: "手记", href: "/blog" }, { label: post.title }]}
            />
            <Link
              href="/blog"
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[8px] px-2 text-xs text-muted hover:bg-primary-soft hover:text-ink"
            >
              <ArrowLeft size={14} aria-hidden />
              返回列表
            </Link>
          </div>

          <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_220px]">
            <article className="min-w-0">
              <header className="max-w-[720px]">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  <time dateTime={post.publishedAt?.toISOString()}>
                    {formatDate(post.publishedAt)}
                  </time>
                  {updated ? (
                    <>
                      <span aria-hidden className="opacity-40">
                        /
                      </span>
                      <span>更新于 {formatDateShort(post.updatedAt)}</span>
                    </>
                  ) : null}
                  <span aria-hidden className="opacity-40">
                    /
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} aria-hidden />
                    约 {minutes} 分钟
                  </span>
                </div>
                <h1 className="page-title mt-4">{post.title}</h1>
                {post.summary ? (
                  <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted">{post.summary}</p>
                ) : null}
                {post.tags.length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {post.tags.map(({ tag }) => (
                      <TagPill key={tag.id} href={`/blog/tags/${tag.slug}`}>
                        {tag.name}
                      </TagPill>
                    ))}
                  </div>
                ) : null}
              </header>

              {post.coverUrl ? (
                <div className="mt-8 max-w-[720px]">
                  <CoverArt
                    src={post.coverUrl}
                    title={post.title}
                    sizes="(min-width: 1080px) 720px, 100vw"
                    priority
                  />
                </div>
              ) : null}

              <div className="mt-8 max-w-[720px]">
                <MobileToc items={toc} />
                <Prose html={html} />
              </div>

              <footer className="mt-12 max-w-[720px] border-t border-line pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs leading-relaxed text-muted">
                    本文采用{" "}
                    <a
                      href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-line underline-offset-4 hover:text-ink"
                    >
                      CC BY-NC-SA 4.0
                    </a>{" "}
                    许可协议，转载请注明作者与出处。
                  </p>
                  <ShareButton title={post.title} />
                </div>
              </footer>

              <nav className="mt-8 grid max-w-[720px] gap-3 sm:grid-cols-2" aria-label="手记导航">
                {newer ? (
                  <Link
                    href={`/blog/${newer.slug}`}
                    className="group rounded-[12px] border border-line p-5 transition-colors hover:border-line-strong"
                  >
                    <span className="caption flex items-center gap-1.5 text-muted">
                      <ArrowLeft size={13} aria-hidden />
                      更新的手记
                    </span>
                    <span className="mt-2 block font-serif text-lg group-hover:text-primary">
                      {newer.title}
                    </span>
                  </Link>
                ) : (
                  <span />
                )}
                {older ? (
                  <Link
                    href={`/blog/${older.slug}`}
                    className="group rounded-[12px] border border-line p-5 text-right transition-colors hover:border-line-strong"
                  >
                    <span className="caption flex items-center justify-end gap-1.5 text-muted">
                      更早的手记
                      <ArrowRight size={13} aria-hidden />
                    </span>
                    <span className="mt-2 block font-serif text-lg group-hover:text-primary">
                      {older.title}
                    </span>
                  </Link>
                ) : null}
              </nav>
            </article>

            <aside className="hidden lg:block" aria-label="文章目录">
              <div className="sticky top-24">
                <TableOfContents items={toc} />
                <div className="mt-6 border-t border-line pt-4">
                  <a
                    href="#top"
                    className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink"
                    onClick={undefined}
                  >
                    <FileText size={13} aria-hidden />
                    回到顶部
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="container-page border-t border-line py-12" aria-labelledby="related-posts-title">
          <h2 id="related-posts-title" className="section-title">
            相关手记
          </h2>
          <div className="mt-4 max-w-[720px] border-t border-line">
            {related.map((item) => (
              <PostRow key={item.id} post={item} showSummary={false} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
