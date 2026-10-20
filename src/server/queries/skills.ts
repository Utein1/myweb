import "server-only";
import { prisma } from "@/lib/db";

export async function getSkillCategories() {
  return prisma.skillCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      skills: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });
}

export async function getTopSkills(limit = 6) {
  return prisma.skill.findMany({
    where: { level: { gte: 4 } },
    orderBy: [{ level: "desc" }, { sortOrder: "asc" }],
    take: limit,
    include: { category: { select: { name: true, slug: true } } },
  });
}

export async function getLearningSkills() {
  return prisma.skill.findMany({
    where: { learning: true },
    orderBy: [{ sortOrder: "asc" }],
    include: { category: { select: { name: true, slug: true } } },
  });
}
