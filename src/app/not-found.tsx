import Link from "next/link";
import { Compass } from "lucide-react";
import { Emblem } from "@/components/site/emblem";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { JsonLd } from "@/components/site/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { formatDateShort } from "@/lib/format";
import { getLatestPosts } from "@/server/queries/posts";

export default async function NotFound() {
  let posts: Awaited<ReturnType<typeof getLatestPosts>> = [];
  try {
    posts = await getLatestPosts(3);
  } catch {
    posts = [];
  }

  return (
    <>
      <SiteHeader />
      <main id="main">
        <div className="container-page flex flex-col items-center py-24 text-center">
          <Emblem size={84} title="冒险者档案" />
          <p className="eyebrow mt-8">404</p>
          <h1 className="page-title mt-3">这份档案不存在</h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
            链接可能已经失效，或内容被移动。回到首页，或继续翻阅手记。
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/" size="lg">
              <Compass size={16} aria-hidden />
              返回首页
            </ButtonLink>
            <ButtonLink href="/blog" variant="secondary" size="lg">
              翻阅手记
            </ButtonLink>
          </div>

          {posts.length > 0 ? (
            <section className="mt-16 w-full max-w-xl text-left" aria-labelledby="notfound-posts">
              <h2 id="notfound-posts" className="caption mb-3 text-muted">
                也许你想看
              </h2>
              <ul className="border-t border-line">
                {posts.map((post) => (
                  <li key={post.id} className="border-b border-line">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="flex items-center justify-between gap-4 py-3 text-sm hover:text-primary"
                    >
                      <span>{post.title}</span>
                      <time className="caption shrink-0 font-mono text-muted">
                        {formatDateShort(post.publishedAt)}
                      </time>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </main>
      <SiteFooter />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebPage", name: "未找到页面" }} />
    </>
  );
}
