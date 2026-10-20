import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/panel";
import { ProjectForm } from "@/components/admin/project-form";
import { Badge } from "@/components/ui/badge";
import { getAdminProject } from "@/server/queries/projects";
import { prisma } from "@/lib/db";
import { SITE_URL, PROJECT_STATUS } from "@/lib/constants";
import { toDateInputValue } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, tags] = await Promise.all([
    getAdminProject(id),
    prisma.tag.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);
  if (!project) notFound();

  const meta = PROJECT_STATUS[project.status] ?? PROJECT_STATUS.PLANNED;

  return (
    <>
      <AdminPageHeader
        eyebrow="Edit commission"
        title={project.title || "未命名委托"}
        description={project.publishedAt ? "已发布，保存后前台立即更新。" : "当前为草稿，前台不可访问。"}
        actions={
          <div className="flex items-center gap-2">
            <Badge tone={meta.tone} dot>
              {meta.label}
            </Badge>
            {project.publishedAt ? (
              <Badge tone="success">已发布</Badge>
            ) : (
              <Badge tone="muted">草稿</Badge>
            )}
          </div>
        }
      />
      <ProjectForm
        initial={{
          id: project.id,
          title: project.title,
          slug: project.slug,
          summary: project.summary,
          content: project.content ?? "",
          coverUrl: project.coverUrl ?? "",
          role: project.role ?? "",
          status: project.status,
          featured: project.featured,
          sortOrder: project.sortOrder,
          startDate: toDateInputValue(project.startDate),
          endDate: toDateInputValue(project.endDate),
          demoUrl: project.demoUrl ?? "",
          repoUrl: project.repoUrl ?? "",
          tags: project.tags.map((item) => item.tag.name),
          seoTitle: project.seoTitle ?? "",
          seoDesc: project.seoDesc ?? "",
          images: project.images.map((image) => ({ url: image.url, alt: image.alt ?? "" })),
          published: Boolean(project.publishedAt),
        }}
        knownTags={tags.map((tag) => tag.name)}
        siteUrl={process.env.SITE_URL ?? SITE_URL}
      />
    </>
  );
}
