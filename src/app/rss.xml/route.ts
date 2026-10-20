import { getPublishedPosts, getPublishedTags } from "@/server/queries/posts";
import { getSiteSettings } from "@/server/queries/site";
import { renderMarkdown } from "@/lib/markdown";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 300;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const [settings, page, tags] = await Promise.all([
    getSiteSettings(),
    getPublishedPosts({ page: 1 }),
    getPublishedTags(),
  ]);

  const posts = page.items.slice(0, 20);
  const items = await Promise.all(
    posts.map(async (post) => {
      const url = absoluteUrl(`/blog/${post.slug}`);
      let description = post.summary;
      if (settings.rssMode === "FULL") {
        try {
          const { html } = await renderMarkdown((await getFullContent(post.slug)) ?? "");
          if (html) description = html;
        } catch {
          // 回退到摘要
        }
      }
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${(post.publishedAt ?? new Date()).toUTCString()}</pubDate>
      <description>${escapeXml(description)}</description>
      <category>${escapeXml(post.tags.map((tag) => tag.name).join(", "))}</category>
      ${settings.rssMode === "FULL" ? `<content:encoded><![CDATA[${description}]]></content:encoded>` : ""}
    </item>`;
    }),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(settings.siteName)} · 手记</title>
    <link>${absoluteUrl("/blog")}</link>
    <description>${escapeXml(settings.tagline || settings.siteName)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${absoluteUrl("/rss.xml")}" rel="self" type="application/rss+xml"/>
    <ttl>5</ttl>${items.join("")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}

async function getFullContent(slug: string) {
  const { prisma } = await import("@/lib/db");
  const post = await prisma.post.findUnique({ where: { slug }, select: { content: true } });
  return post?.content ?? null;
}
