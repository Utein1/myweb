export const SITE_NAME_FALLBACK = "冒险者档案";
export const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

export const PAGE_SIZE_PROJECTS = 9;
export const PAGE_SIZE_POSTS = 10;
export const PAGE_SIZE_MEDIA = 40;

export const NAV_LINKS = [
  { href: "/about", label: "关于" },
  { href: "/skills", label: "技能" },
  { href: "/projects", label: "委托" },
  { href: "/blog", label: "手记" },
] as const;

export type Tone = "primary" | "success" | "muted" | "warning" | "dashed" | "danger";

export const PROJECT_STATUS: Record<
  string,
  { label: string; tone: Tone }
> = {
  PLANNED: { label: "计划中", tone: "muted" },
  IN_PROGRESS: { label: "进行中", tone: "primary" },
  COMPLETED: { label: "已完成", tone: "success" },
  ARCHIVED: { label: "已归档", tone: "dashed" },
};

export const PROJECT_STATUS_OPTIONS = Object.entries(PROJECT_STATUS).map(
  ([value, meta]) => ({ value, label: meta.label }),
);

export const POST_STATUS: Record<string, { label: string; tone: Tone }> = {
  DRAFT: { label: "草稿", tone: "warning" },
  PUBLISHED: { label: "已发布", tone: "success" },
  SCHEDULED: { label: "定时", tone: "primary" },
};

export const POST_STATUS_OPTIONS = Object.entries(POST_STATUS).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

export const SKILL_LEVELS = [
  { level: 1, name: "见习", description: "能读懂并修改示例代码" },
  { level: 2, name: "熟练", description: "能在指引下完成常规任务" },
  { level: 3, name: "精通", description: "能独立负责模块并排查问题" },
  { level: 4, name: "专精", description: "能主导方案设计并指导他人" },
  { level: 5, name: "大师", description: "有对外输出（开源、演讲、规范制定）" },
] as const;

export function skillLevelName(level: number) {
  return SKILL_LEVELS.find((item) => item.level === level)?.name ?? "见习";
}

export const SOCIAL_PLATFORMS = [
  "github",
  "email",
  "twitter",
  "linkedin",
  "juejin",
  "zhihu",
  "bilibili",
  "rss",
  "website",
] as const;

export type SocialLink = { platform: string; label: string; url: string };
