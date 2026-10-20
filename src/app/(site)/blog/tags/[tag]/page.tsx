import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/site/section-heading";
import { PostRow } from "@/components/site/post-row";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { ButtonLink } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";
import { getPublishedPosts, getTagBySlug } from "@/server/queries/posts";
import { getSiteSettings } from "@/server/queries/site";

export const revalidate = 300;

type Params = Promise<{ tag: string }>;
type SearchParams = Promise<{ page?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { tag: slug } = await params;
  const [tag, settings] = await Promise.all([getTagBySlug(slug), getSiteSettings()]);
  return buildMetadata(
    {
      title: tag ? `标签 · ${tag.name}` : "标签",
      description: tag ? `带有「${tag.name}」标签的全部手记。` : undefined,
      path: `/blog/tags/${slug}`,
    },
    {
      siteName: settings.siteName,
      title: settings.defaultSeoTitle,
      description: settings.defaultSeoDesc,
      ogImage: settings.defaultOgImageUrl,
    },
  );
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ tag: slug }, query] = await Promise.all([params, searchParams]);
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const pageNumber = Number(query.page ?? "1");
  const page = Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1;
  const data = await getPublishedPosts({ tag: slug, page });
  if (data.total > 0 && page > data.totalPages) notFound();

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
          eyebrow="标签聚合"
          title={`#${tag.name}`}
          description={`共 ${data.total} 篇带有该标签的手记。`}
        />
      </div>

      {data.items.length > 0 ? (
        <div className="mt-8 max-w-[820px] border-t border-line">
          {data.items.map((post) => (
            <PostRow key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="该标签下暂无手记"
            description="去手记列表看看其他内容。"
            action={<ButtonLink href="/blog">返回手记</ButtonLink>}
          />
        </div>
      )}

      <Pagination
        basePath={`/blog/tags/${slug}`}
        page={data.page}
        totalPages={data.totalPages}
      />
    </div>
  );
}
