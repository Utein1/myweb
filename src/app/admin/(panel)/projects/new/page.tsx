import { AdminPageHeader } from "@/components/admin/panel";
import { ProjectForm } from "@/components/admin/project-form";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" }, select: { name: true } });

  return (
    <>
      <AdminPageHeader
        eyebrow="New commission"
        title="新建委托"
        description="先保存草稿，补充封面与正文后再发布。发布后立即出现在前台列表。"
      />
      <ProjectForm
        initial={{
          id: "",
          title: "",
          slug: "",
          summary: "",
          content: "",
          coverUrl: "",
          role: "",
          status: "PLANNED",
          featured: false,
          sortOrder: 0,
          startDate: "",
          endDate: "",
          demoUrl: "",
          repoUrl: "",
          tags: [],
          seoTitle: "",
          seoDesc: "",
          images: [],
          published: false,
        }}
        knownTags={tags.map((tag) => tag.name)}
        siteUrl={process.env.SITE_URL ?? SITE_URL}
      />
    </>
  );
}
