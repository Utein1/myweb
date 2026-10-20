"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { guardAction } from "@/lib/auth";
import { json, str } from "@/lib/form";
import { fail, fieldErrors, ok, projectSchema, type ActionResult } from "@/schemas";
import { ensureSlug } from "@/lib/slug";
import { revalidateSite, replaceProjectImages, replaceProjectTags } from "@/server/mutations/shared";

function parseDate(value: string) {
  if (!value) return null;
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00+08:00`)
    : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function saveProjectAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await guardAction();
  if (!guard.ok) return guard;

  const id = str(formData, "id");
  const title = str(formData, "title");
  const rawSlug = str(formData, "slug") || ensureSlug(title, "project");

  const parsed = projectSchema.safeParse({
    title,
    slug: rawSlug,
    summary: str(formData, "summary"),
    content: str(formData, "content"),
    coverUrl: str(formData, "coverUrl"),
    role: str(formData, "role"),
    status: str(formData, "status") || "PLANNED",
    featured: str(formData, "featured") === "on",
    sortOrder: str(formData, "sortOrder") || "0",
    startDate: str(formData, "startDate"),
    endDate: str(formData, "endDate"),
    demoUrl: str(formData, "demoUrl"),
    repoUrl: str(formData, "repoUrl"),
    tags: str(formData, "tags")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    seoTitle: str(formData, "seoTitle"),
    seoDesc: str(formData, "seoDesc"),
    statusPublish: str(formData, "statusPublish") || "DRAFT",
    publishedAt: str(formData, "publishedAt"),
    images: json<{ url: string; alt?: string }[]>(formData, "images", []),
  });
  if (!parsed.success) return fieldErrors(parsed.error);

  const data = parsed.data;
  const isPublishing = data.statusPublish === "PUBLISHED";

  if (isPublishing && !data.coverUrl) {
    return fail("VALIDATION", "发布前需要上传封面图", "coverUrl");
  }

  const duplicate = await prisma.project.findUnique({ where: { slug: data.slug } });
  if (duplicate && duplicate.id !== id) {
    return fail("DUPLICATE", "该标识已存在，请换一个 slug", "slug");
  }

  const startDate = parseDate(data.startDate);
  const endDate = parseDate(data.endDate);
  if (startDate && endDate && endDate < startDate) {
    return fail("VALIDATION", "结束时间不能早于开始时间", "endDate");
  }

  if (data.featured) {
    const featuredCount = await prisma.project.count({
      where: { featured: true, publishedAt: { not: null }, id: { not: id || undefined } },
    });
    if (featuredCount >= 3) {
      return fail("VALIDATION", "首页精选最多 3 个，请先取消其他委托的精选", "featured");
    }
  }

  const existing = id
    ? await prisma.project.findUnique({ where: { id }, select: { publishedAt: true } })
    : null;

  const publishedAt = isPublishing
    ? existing?.publishedAt ?? parseDate(data.publishedAt) ?? new Date()
    : null;

  const payload = {
    title: data.title,
    slug: data.slug,
    summary: data.summary,
    content: data.content || null,
    coverUrl: data.coverUrl || null,
    role: data.role || null,
    status: data.status,
    featured: data.featured,
    sortOrder: data.sortOrder,
    startDate,
    endDate,
    demoUrl: data.demoUrl || null,
    repoUrl: data.repoUrl || null,
    seoTitle: data.seoTitle || null,
    seoDesc: data.seoDesc || null,
    publishedAt,
  };

  let projectId = id;
  if (id) {
    await prisma.project.update({ where: { id }, data: payload });
  } else {
    const created = await prisma.project.create({ data: payload });
    projectId = created.id;
  }

  if (!projectId) return fail("ERROR", "保存失败，请重试");

  await replaceProjectTags(projectId, data.tags);
  await replaceProjectImages(
    projectId,
    data.images.filter((image) => image.url.trim()).slice(0, 8),
  );

  revalidateSite();
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${projectId}`);

  if (!id) redirect(`/admin/projects/${projectId}?saved=1`);
  return ok(null);
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  const guard = await guardAction();
  if (!guard.ok) return;
  const id = str(formData, "id");
  if (!id) return;
  await prisma.project.delete({ where: { id } }).catch(() => null);
  revalidateSite();
  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

export async function toggleProjectPublishAction(formData: FormData): Promise<void> {
  const guard = await guardAction();
  if (!guard.ok) return;
  const id = str(formData, "id");
  const publish = str(formData, "publish") === "1";
  if (!id) return;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return;

  if (publish && !project.coverUrl) return;

  await prisma.project.update({
    where: { id },
    data: {
      publishedAt: publish ? project.publishedAt ?? new Date() : null,
      updatedAt: new Date(),
    },
  });
  revalidateSite();
  revalidatePath("/admin/projects");
}
