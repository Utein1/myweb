import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { PAGE_SIZE_POSTS } from "@/lib/constants";
import { readingTime } from "@/lib/reading-time";
import { excerpt } from "@/lib/utils";

/** 每次查询重新取当前时间，避免模块级日期把定时发布的内容挡在门外。 */
export function publishedPostFilter(): Prisma.PostWhereInput {
  return {
    status: "PUBLISHED",
    publishedAt: { not: null, lte: new Date() },
  };
}

const listSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  content: true,
  coverUrl: true,
  pinned: true,
  publishedAt: true,
  updatedAt: true,
  tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
} satisfies Prisma.PostSelect;

type PostListRow = Prisma.PostGetPayload<{ select: typeof listSelect }>;

export type PostListItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverUrl: string | null;
  pinned: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
  minutes: number;
  tags: { id: string; name: string; slug: string }[];
};

function toListItem(row: PostListRow): PostListItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary?.trim() || excerpt(row.content, 120),
    coverUrl: row.coverUrl,
    pinned: row.pinned,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    minutes: readingTime(row.content),
    tags: row.tags.map((item) => item.tag),
  };
}

export async function getPublishedPosts(options: { page?: number; tag?: string; q?: string } = {}) {
  const pageSize = PAGE_SIZE_POSTS;
  const page = Math.max(1, options.page ?? 1);
  const where: Prisma.PostWhereInput = { ...publishedPostFilter() };
  if (options.tag) where.tags = { some: { tag: { slug: options.tag } } };
  if (options.q) {
    where.OR = [{ title: { contains: options.q } }, { content: { contains: options.q } }];
  }

  const [total, rows] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: listSelect,
    }),
  ]);

  return {
    items: rows.map(toListItem),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getPinnedPosts(limit = 2) {
  const rows = await prisma.post.findMany({
    where: { ...publishedPostFilter(), pinned: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: listSelect,
  });
  return rows.map(toListItem);
}

export async function getLatestPosts(limit = 3, excludeIds: string[] = []) {
  const rows = await prisma.post.findMany({
    where: { ...publishedPostFilter(), id: { notIn: excludeIds } },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: listSelect,
  });
  return rows.map(toListItem);
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findFirst({
    where: { slug, ...publishedPostFilter() },
    include: { tags: { include: { tag: true } } },
  });
}

export async function getPublishedPostSlugs() {
  return prisma.post.findMany({
    where: publishedPostFilter(),
    select: { slug: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getAdjacentPosts(currentId: string) {
  const rows = await prisma.post.findMany({
    where: publishedPostFilter(),
    orderBy: { publishedAt: "desc" },
    select: { id: true, slug: true, title: true },
  });
  const index = rows.findIndex((row) => row.id === currentId);
  return {
    newer: index > 0 ? rows[index - 1] : null,
    older: index >= 0 && index < rows.length - 1 ? rows[index + 1] : null,
  };
}

export async function getRelatedPosts(postId: string, tagIds: string[], limit = 3) {
  if (tagIds.length === 0) return [];
  const rows = await prisma.post.findMany({
    where: {
      ...publishedPostFilter(),
      id: { not: postId },
      tags: { some: { tagId: { in: tagIds } } },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: listSelect,
  });
  return rows.map(toListItem);
}

export async function getPublishedTags() {
  const rows = await prisma.postTag.findMany({
    where: { post: publishedPostFilter() },
    select: { tag: { select: { id: true, name: true, slug: true } } },
  });
  const map = new Map<string, { id: string; name: string; slug: string; count: number }>();
  for (const row of rows) {
    const current = map.get(row.tag.id);
    if (current) current.count += 1;
    else map.set(row.tag.id, { ...row.tag, count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function getTagBySlug(slug: string) {
  return prisma.tag.findUnique({ where: { slug } });
}

export async function getArchive() {
  const rows = await prisma.post.findMany({
    where: publishedPostFilter(),
    orderBy: { publishedAt: "desc" },
    select: { id: true, slug: true, title: true, publishedAt: true },
  });
  const map = new Map<string, { key: string; label: string; posts: typeof rows }>();
  for (const row of rows) {
    const date = row.publishedAt ?? new Date();
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`;
    const bucket = map.get(key) ?? { key, label, posts: [] };
    bucket.posts.push(row);
    map.set(key, bucket);
  }
  return [...map.values()];
}

// ---------------------------- 后台 ----------------------------

export async function getAdminPosts(options: { status?: string; q?: string } = {}) {
  const where: Prisma.PostWhereInput = {};
  if (options.status && options.status !== "ALL") where.status = options.status;
  if (options.q) {
    where.OR = [{ title: { contains: options.q } }, { slug: { contains: options.q } }];
  }
  const rows = await prisma.post.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      pinned: true,
      publishedAt: true,
      updatedAt: true,
      tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
    },
  });
  return rows.map((row) => ({
    ...row,
    tags: row.tags.map((item) => item.tag),
  }));
}

export async function getAdminPost(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  });
}

export async function getPreviewPost(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  });
}
