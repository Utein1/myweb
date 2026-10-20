"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { guardAction } from "@/lib/auth";
import { str } from "@/lib/form";
import { fail, fieldErrors, ok, postSchema, type ActionResult } from "@/schemas";
import { ensureSlug } from "@/lib/slug";
import { revalidateSite, replacePostTags } from "@/server/mutations/shared";

function parseDateTime(value: string) {
  if (!value) return null;
  const normalized =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) ? `${value}:00+08:00` : value;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function savePostAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await guardAction();
  if (!guard.ok) return guard;

  const id = str(formData, "id");
  const title = str(formData, "title");
  const rawSlug = str(formData, "slug") || ensureSlug(title, "post");

  const parsed = postSchema.safeParse({
    title,
    slug: rawSlug,
    summary: str(formData, "summary"),
    content: str(formData, "content"),
    coverUrl: str(formData, "coverUrl"),
    pinned: str(formData, "pinned") === "on",
    status: str(formData, "status") || "DRAFT",
    publishedAt: str(formData, "publishedAt"),
    tags: str(formData, "tags")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    seoTitle: str(formData, "seoTitle"),
    seoDesc: str(formData, "seoDesc"),
  });
  if (!parsed.success) return fieldErrors(parsed.error);

  const data = parsed.data;

  const duplicate = await prisma.post.findUnique({ where: { slug: data.slug } });
  if (duplicate && duplicate.id !== id) {
    return fail("DUPLICATE", "该标识已存在，请换一个 slug", "slug");
  }

  const existing = id
    ? await prisma.post.findUnique({ where: { id }, select: { publishedAt: true, status: true } })
    : null;

  let status = data.status;
  let publishedAt = parseDateTime(data.publishedAt);

  if (status === "DRAFT") {
    publishedAt = null;
  } else if (status === "SCHEDULED") {
    if (!publishedAt) return fail("VALIDATION", "定时发布需要填写发布时间", "publishedAt");
    if (publishedAt.getTime() <= Date.now()) status = "PUBLISHED";
  } else if (status === "PUBLISHED") {
    publishedAt = existing?.publishedAt ?? publishedAt ?? new Date();
    if (publishedAt.getTime() > Date.now()) status = "SCHEDULED";
  }

  const payload = {
    title: data.title,
    slug: data.slug,
    summary: data.summary || null,
    content: data.content,
    coverUrl: data.coverUrl || null,
    pinned: data.pinned,
    status,
    publishedAt,
    seoTitle: data.seoTitle || null,
    seoDesc: data.seoDesc || null,
  };

  let postId = id;
  if (id) {
    await prisma.post.update({ where: { id }, data: payload });
  } else {
    const created = await prisma.post.create({ data: payload });
    postId = created.id;
  }
  if (!postId) return fail("ERROR", "保存失败，请重试");

  await replacePostTags(postId, data.tags);

  revalidateSite();
  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${postId}`);

  if (!id) redirect(`/admin/posts/${postId}?saved=1`);
  return ok(null);
}

export async function deletePostAction(formData: FormData): Promise<void> {
  const guard = await guardAction();
  if (!guard.ok) return;
  const id = str(formData, "id");
  if (!id) return;
  await prisma.post.delete({ where: { id } }).catch(() => null);
  revalidateSite();
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function togglePostPublishAction(formData: FormData): Promise<void> {
  const guard = await guardAction();
  if (!guard.ok) return;
  const id = str(formData, "id");
  const publish = str(formData, "publish") === "1";
  if (!id) return;

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return;

  await prisma.post.update({
    where: { id },
    data: publish
      ? {
          status: "PUBLISHED",
          publishedAt: post.publishedAt ?? new Date(),
          updatedAt: new Date(),
        }
      : { status: "DRAFT", publishedAt: null, updatedAt: new Date() },
  });
  revalidateSite();
  revalidatePath("/admin/posts");
}

/** 草稿自动保存（编辑器每 20 秒调用，仅草稿状态生效） */
export async function autosavePostAction(input: {
  id: string;
  title: string;
  content: string;
}): Promise<{ ok: boolean; savedAt?: string; message?: string }> {
  const guard = await guardAction();
  if (!guard.ok) return { ok: false, message: "登录已过期" };
  if (!input.id) return { ok: false };

  const post = await prisma.post.findUnique({
    where: { id: input.id },
    select: { status: true },
  });
  if (!post) return { ok: false, message: "文章不存在" };
  if (post.status !== "DRAFT") return { ok: false, message: "仅草稿会自动保存" };

  await prisma.post.update({
    where: { id: input.id },
    data: { title: input.title.slice(0, 120), content: input.content },
  });
  revalidatePath("/admin/posts");
  return { ok: true, savedAt: new Date().toISOString() };
}
