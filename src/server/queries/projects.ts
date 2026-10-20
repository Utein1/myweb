import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { PAGE_SIZE_PROJECTS } from "@/lib/constants";

/** 每次查询重新取当前时间，避免模块级日期让新发布内容延迟可见。 */
function publishedFilter(): Prisma.ProjectWhereInput {
  return { publishedAt: { not: null, lte: new Date() } };
}

const listSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  coverUrl: true,
  status: true,
  featured: true,
  role: true,
  startDate: true,
  endDate: true,
  publishedAt: true,
  sortOrder: true,
  tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
} satisfies Prisma.ProjectSelect;

export type ProjectListItem = Prisma.ProjectGetPayload<{ select: typeof listSelect }>;

export async function getPublishedProjects(options: {
  status?: string;
  tag?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}) {
  const pageSize = options.pageSize ?? PAGE_SIZE_PROJECTS;
  const page = Math.max(1, options.page ?? 1);
  const where: Prisma.ProjectWhereInput = { ...publishedFilter() };

  if (options.status && ["PLANNED", "IN_PROGRESS", "COMPLETED", "ARCHIVED"].includes(options.status)) {
    where.status = options.status;
  }
  if (options.tag) {
    where.tags = { some: { tag: { slug: options.tag } } };
  }
  if (options.q) {
    where.OR = [
      { title: { contains: options.q } },
      { summary: { contains: options.q } },
    ];
  }

  const [total, items, allTags] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: listSelect,
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { projects: true } },
      },
    }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    tags: allTags.filter((tag) => tag._count.projects > 0),
  };
}

export async function getProjectStatusCounts() {
  const groups = await prisma.project.groupBy({
    by: ["status"],
    where: publishedFilter(),
    _count: { _all: true },
  });
  const counts: Record<string, number> = {};
  for (const group of groups) counts[group.status] = group._count._all;
  return counts;
}

export async function getFeaturedProjects(limit = 3) {
  return prisma.project.findMany({
    where: { ...publishedFilter(), featured: true },
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    take: limit,
    select: listSelect,
  });
}

export async function getProjectBySlug(slug: string) {
  return prisma.project.findFirst({
    where: { slug, ...publishedFilter() },
    include: {
      images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      tags: { include: { tag: true } },
    },
  });
}

export async function getPublishedProjectSlugs() {
  return prisma.project.findMany({
    where: publishedFilter(),
    select: { slug: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getAdjacentProjects(currentId: string) {
  const items = await prisma.project.findMany({
    where: publishedFilter(),
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: { id: true, slug: true, title: true },
  });
  const index = items.findIndex((item) => item.id === currentId);
  return {
    previous: index > 0 ? items[index - 1] : null,
    next: index >= 0 && index < items.length - 1 ? items[index + 1] : null,
  };
}

export async function getRelatedProjects(projectId: string, tagIds: string[], limit = 3) {
  if (tagIds.length === 0) return [];
  return prisma.project.findMany({
    where: {
      ...publishedFilter(),
      id: { not: projectId },
      tags: { some: { tagId: { in: tagIds } } },
    },
    orderBy: [{ publishedAt: "desc" }],
    take: limit,
    select: listSelect,
  });
}

// ---------------------------- 后台 ----------------------------

export async function getAdminProjects(options: { status?: string; q?: string } = {}) {
  const where: Prisma.ProjectWhereInput = {};
  if (options.status && options.status !== "ALL") where.status = options.status;
  if (options.q) {
    where.OR = [{ title: { contains: options.q } }, { slug: { contains: options.q } }];
  }
  return prisma.project.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      coverUrl: true,
      featured: true,
      publishedAt: true,
      updatedAt: true,
      tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
    },
  });
}

export async function getAdminProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } }, tags: { include: { tag: true } } },
  });
}
