import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import type { SocialLink } from "@/lib/constants";
import { parseJsonArray } from "@/lib/utils";

export type SiteSettingsView = {
  siteName: string;
  tagline: string;
  emblemUrl: string | null;
  primaryColor: string;
  defaultSeoTitle: string;
  defaultSeoDesc: string;
  defaultOgImageUrl: string | null;
  socialLinks: SocialLink[];
  footerText: string;
  icpNumber: string;
  resumeUrl: string | null;
  rssMode: "SUMMARY" | "FULL";
};

export const getSiteSettings = cache(async (): Promise<SiteSettingsView> => {
  const row = await prisma.siteSetting.findUnique({ where: { id: "singleton" } });
  return {
    siteName: row?.siteName || "冒险者档案",
    tagline: row?.tagline ?? "",
    emblemUrl: row?.emblemUrl ?? null,
    primaryColor: row?.primaryColor || "#1F7F91",
    defaultSeoTitle: row?.defaultSeoTitle ?? "",
    defaultSeoDesc: row?.defaultSeoDesc ?? "",
    defaultOgImageUrl: row?.defaultOgImageUrl ?? null,
    socialLinks: parseJsonArray<SocialLink>(row?.socialLinks, []),
    footerText: row?.footerText ?? "把复杂系统做得简单，把简单界面做得可靠。",
    icpNumber: row?.icpNumber ?? "",
    resumeUrl: row?.resumeUrl ?? null,
    rssMode: row?.rssMode === "FULL" ? "FULL" : "SUMMARY",
  };
});

export type ProfileView = {
  id: string;
  avatarUrl: string | null;
  displayName: string;
  title: string;
  className: string;
  affiliation: string;
  location: string;
  headline: string;
  bio: string;
  yearsExperience: number | null;
  email: string;
};

export const getProfile = cache(async (): Promise<ProfileView | null> => {
  const row = await prisma.profile.findUnique({ where: { id: "main" } });
  if (!row) return null;
  return {
    id: row.id,
    avatarUrl: row.avatarUrl,
    displayName: row.displayName,
    title: row.title ?? "",
    className: row.className ?? "",
    affiliation: row.affiliation ?? "",
    location: row.location ?? "",
    headline: row.headline ?? "",
    bio: row.bio ?? "",
    yearsExperience: row.yearsExperience,
    email: row.email ?? "",
  };
});

export const getTimeline = cache(async () => {
  return prisma.timelineEntry.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
});

export const getPublicStats = cache(async () => {
  const now = new Date();
  const [projects, posts, profile] = await Promise.all([
    prisma.project.count({ where: { publishedAt: { not: null, lte: now } } }),
    prisma.post.count({
      where: { status: "PUBLISHED", publishedAt: { not: null, lte: now } },
    }),
    prisma.profile.findUnique({ where: { id: "main" }, select: { yearsExperience: true } }),
  ]);
  return { projects, posts, years: profile?.yearsExperience ?? null };
});

export const getDashboardStats = cache(async () => {
  const [publishedProjects, inProgressProjects, publishedPosts, draftPosts, mediaCount, unreadMessages] =
    await Promise.all([
      prisma.project.count({ where: { publishedAt: { not: null } } }),
      prisma.project.count({ where: { status: "IN_PROGRESS" } }),
      prisma.post.count({ where: { status: "PUBLISHED" } }),
      prisma.post.count({ where: { status: "DRAFT" } }),
      prisma.media.count(),
      prisma.contactMessage.count({ where: { readAt: null } }),
    ]);
  return {
    publishedProjects,
    inProgressProjects,
    publishedPosts,
    draftPosts,
    mediaCount,
    unreadMessages,
  };
});

export const getRecentEdits = cache(async () => {
  const [projects, posts] = await Promise.all([
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, updatedAt: true },
    }),
    prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, updatedAt: true },
    }),
  ]);
  return [
    ...projects.map((item) => ({ ...item, type: "project" as const })),
    ...posts.map((item) => ({ ...item, type: "post" as const })),
  ]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);
});
