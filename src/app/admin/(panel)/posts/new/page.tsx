import { AdminPageHeader } from "@/components/admin/panel";
import { PostForm } from "@/components/admin/post-form";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" }, select: { name: true } });

  return (
    <>
      <AdminPageHeader
        eyebrow="New journal entry"
        title="新建手记"
        description="先写正文，保存草稿后再补封面与 SEO。发布前可用预览检查渲染效果。"
      />
      <PostForm
        initial={{
          id: "",
          title: "",
          slug: "",
          summary: "",
          content: "",
          coverUrl: "",
          pinned: false,
          status: "DRAFT",
          publishedAt: "",
          tags: [],
          seoTitle: "",
          seoDesc: "",
          published: false,
        }}
        knownTags={tags.map((tag) => tag.name)}
        siteUrl={process.env.SITE_URL ?? SITE_URL}
      />
    </>
  );
}
