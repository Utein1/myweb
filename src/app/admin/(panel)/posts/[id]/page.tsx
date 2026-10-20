import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/panel";
import { PostForm } from "@/components/admin/post-form";
import { Badge } from "@/components/ui/badge";
import { getAdminPost } from "@/server/queries/posts";
import { prisma } from "@/lib/db";
import { SITE_URL, POST_STATUS } from "@/lib/constants";
import { toDateTimeInputValue } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, tags] = await Promise.all([
    getAdminPost(id),
    prisma.tag.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);
  if (!post) notFound();

  const meta = POST_STATUS[post.status] ?? POST_STATUS.DRAFT;

  return (
    <>
      <AdminPageHeader
        eyebrow="Edit journal entry"
        title={post.title || "未命名手记"}
        description={
          post.status === "PUBLISHED"
            ? "已发布。保存后前台立即更新。"
            : post.status === "SCHEDULED"
              ? "等待定时发布，到点后由定时任务上线。"
              : "当前为草稿，仅自己可见。"
        }
        actions={
          <Badge tone={meta.tone} dot>
            {meta.label}
          </Badge>
        }
      />
      <PostForm
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          summary: post.summary ?? "",
          content: post.content,
          coverUrl: post.coverUrl ?? "",
          pinned: post.pinned,
          status: post.status as "DRAFT" | "PUBLISHED" | "SCHEDULED",
          publishedAt: toDateTimeInputValue(post.publishedAt),
          tags: post.tags.map((item) => item.tag.name),
          seoTitle: post.seoTitle ?? "",
          seoDesc: post.seoDesc ?? "",
          published: post.status === "PUBLISHED",
        }}
        knownTags={tags.map((tag) => tag.name)}
        siteUrl={process.env.SITE_URL ?? SITE_URL}
      />
    </>
  );
}
