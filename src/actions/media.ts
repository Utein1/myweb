"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { guardAction } from "@/lib/auth";
import { bool, str } from "@/lib/form";
import { fail, ok, type ActionResult } from "@/schemas";
import { deleteUpload } from "@/lib/storage";

export async function renameMediaAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await guardAction();
  if (!guard.ok) return guard;
  const id = str(formData, "id");
  const filename = str(formData, "filename").trim();
  if (!id) return fail("VALIDATION", "缺少媒体 ID");
  if (!filename) return fail("VALIDATION", "文件名不能为空", "filename");

  await prisma.media.update({ where: { id }, data: { filename: filename.slice(0, 120) } });
  revalidatePath("/admin/media");
  return ok(null);
}

export async function deleteMediaAction(formData: FormData): Promise<void> {
  const guard = await guardAction();
  if (!guard.ok) return;
  const id = str(formData, "id");
  const force = bool(formData, "force");
  if (!id) return;

  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return;

  if (!force) {
    const [posts, projects] = await Promise.all([
      prisma.post.count({ where: { content: { contains: media.url } } }),
      prisma.project.count({
        where: {
          OR: [{ content: { contains: media.url } }, { coverUrl: media.url }],
        },
      }),
    ]);
    const imageRefs = await prisma.projectImage.count({ where: { url: media.url } });
    if (posts + projects + imageRefs > 0) {
      revalidatePath("/admin/media");
      return;
    }
  }

  await prisma.media.delete({ where: { id } }).catch(() => null);
  await deleteUpload(media.key);
  revalidatePath("/admin/media");
}

/** 统计引用数量，用于删除前提示 */
export async function countMediaReferences(url: string) {
  const [posts, projects, cover, images] = await Promise.all([
    prisma.post.count({ where: { content: { contains: url } } }),
    prisma.project.count({ where: { content: { contains: url } } }),
    prisma.project.count({ where: { coverUrl: url } }),
    prisma.projectImage.count({ where: { url } }),
  ]);
  return posts + projects + cover + images;
}
