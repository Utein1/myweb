import { Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/panel";
import { MediaLibrary, type MediaItem } from "@/components/admin/media-library";
import { Input } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import { PAGE_SIZE_MEDIA } from "@/lib/constants";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page: pageParam, q = "" } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where = q ? { filename: { contains: q } } : {};

  const [total, rows, posts, projects, projectImages] = await Promise.all([
    prisma.media.count({ where }),
    prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE_MEDIA,
      take: PAGE_SIZE_MEDIA,
    }),
    prisma.post.findMany({ select: { content: true } }),
    prisma.project.findMany({ select: { content: true, coverUrl: true } }),
    prisma.projectImage.findMany({ select: { url: true } }),
  ]);

  function countRefs(url: string) {
    let count = 0;
    for (const post of posts) if (post.content.includes(url)) count += 1;
    for (const project of projects) {
      if (project.content?.includes(url)) count += 1;
      if (project.coverUrl === url) count += 1;
    }
    for (const image of projectImages) if (image.url === url) count += 1;
    return count;
  }

  const items: MediaItem[] = rows.map((row) => ({
    id: row.id,
    url: row.url,
    filename: row.filename,
    mimeType: row.mimeType,
    size: row.size,
    width: row.width,
    height: row.height,
    createdAt: row.createdAt.toISOString(),
    refs: countRefs(row.url),
  }));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE_MEDIA));

  return (
    <>
      <AdminPageHeader
        eyebrow="Media"
        title="媒体库"
        description="上传后会同时登记到数据库，正文、封面与图集都从这里取图。删除前会提示引用数量。"
        actions={
          <form action="/admin/media" method="get" className="flex items-center gap-2">
            <label htmlFor="media-search" className="sr-only">
              搜索文件名
            </label>
            <div className="relative">
              <Search
                size={15}
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <Input
                id="media-search"
                name="q"
                defaultValue={q}
                placeholder="搜索文件名"
                className="w-[190px] pl-9"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-[8px] border border-line px-3 text-sm hover:border-line-strong"
            >
              搜索
            </button>
          </form>
        }
      />

      <MediaLibrary items={items} />

      <Pagination
        basePath="/admin/media"
        page={page}
        totalPages={totalPages}
        params={{ q: q || undefined }}
      />
    </>
  );
}
