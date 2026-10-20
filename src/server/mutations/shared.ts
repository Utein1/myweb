import "server-only";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

/** 内容写操作后统一失效全站缓存（导航、页脚、列表与详情） */
export function revalidateSite() {
  revalidatePath("/", "layout");
}

export async function uniqueTag(name: string, currentId?: string) {
  const clean = name.trim().slice(0, 20);
  const base = slugify(clean) || `tag-${Math.random().toString(36).slice(2, 6)}`;
  let slug = base;
  let index = 2;
  while (true) {
    const existing = await prisma.tag.findUnique({ where: { slug } });
    if (!existing || existing.id === currentId) break;
    slug = `${base}-${index}`;
    index += 1;
    if (index > 30) {
      slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
      break;
    }
  }
  return prisma.tag.upsert({
    where: { name: clean },
    update: {},
    create: { name: clean, slug },
  });
}

export async function replacePostTags(postId: string, names: string[]) {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const name of names) {
    const clean = name.trim();
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    const tag = await uniqueTag(clean);
    ids.push(tag.id);
  }
  await prisma.postTag.deleteMany({ where: { postId } });
  if (ids.length > 0) {
    await prisma.postTag.createMany({ data: ids.map((tagId) => ({ postId, tagId })) });
  }
}

export async function replaceProjectTags(projectId: string, names: string[]) {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const name of names) {
    const clean = name.trim();
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    const tag = await uniqueTag(clean);
    ids.push(tag.id);
  }
  await prisma.projectTag.deleteMany({ where: { projectId } });
  if (ids.length > 0) {
    await prisma.projectTag.createMany({ data: ids.map((tagId) => ({ projectId, tagId })) });
  }
}

export async function replaceProjectImages(
  projectId: string,
  images: { url: string; alt?: string }[],
) {
  await prisma.projectImage.deleteMany({ where: { projectId } });
  if (images.length === 0) return;
  await prisma.projectImage.createMany({
    data: images.slice(0, 8).map((image, index) => ({
      projectId,
      url: image.url,
      alt: image.alt?.slice(0, 100) || null,
      sortOrder: index + 1,
    })),
  });
}
