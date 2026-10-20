import { z } from "zod";

export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; field?: string } };

export function fail(code: string, message: string, field?: string): ActionResult<never> {
  return { ok: false, error: { code, message, field } };
}

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fieldErrors(error: z.ZodError): ActionResult<never> {
  const first = error.issues[0];
  return {
    ok: false,
    error: {
      code: "VALIDATION",
      message: first?.message ?? "输入不合法",
      field: first?.path?.[0]?.toString(),
    },
  };
}

const optionalText = (max: number, message?: string) =>
  z.string().trim().max(max, message ?? `最多 ${max} 字`).optional().default("");

const urlOrPath = z
  .string()
  .trim()
  .refine((value) => !value || /^(https?:\/\/|\/)/.test(value), "请输入合法地址");

export const slugSchema = z
  .string()
  .trim()
  .min(1, "请填写标识")
  .max(80, "标识最多 80 字符")
  .regex(/^[a-z0-9-]+$/, "标识只能包含小写字母、数字与连字符");

export const loginSchema = z.object({
  email: z.string().trim().email("请输入合法邮箱"),
  password: z.string().min(1, "请输入密码"),
  remember: z.boolean().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "请输入当前密码"),
    newPassword: z.string().min(10, "新密码至少 10 位"),
    confirmPassword: z.string().min(1, "请再次输入新密码"),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

export const socialLinkSchema = z.object({
  platform: z.string().trim().min(1, "请选择平台"),
  label: z.string().trim().min(1, "请填写名称").max(20, "名称最多 20 字"),
  url: z
    .string()
    .trim()
    .min(1, "请填写地址")
    .refine(
      (value) => /^(https?:\/\/|mailto:|#|\/)/.test(value),
      "链接需以 http(s)://、mailto: 或 / 开头",
    ),
});

export const settingsSchema = z.object({
  siteName: z.string().trim().min(1, "站点名必填").max(30, "站点名最多 30 字"),
  tagline: optionalText(60),
  emblemUrl: urlOrPath,
  primaryColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "请输入 #RRGGBB 格式的颜色"),
  defaultSeoTitle: optionalText(60),
  defaultSeoDesc: optionalText(160),
  defaultOgImageUrl: urlOrPath,
  socialLinks: z.array(socialLinkSchema).max(12, "最多 12 个社交链接").default([]),
  footerText: optionalText(120),
  icpNumber: optionalText(40),
  resumeUrl: urlOrPath,
  rssMode: z.enum(["SUMMARY", "FULL"]).default("SUMMARY"),
});

export const profileSchema = z.object({
  displayName: z.string().trim().min(1, "姓名必填").max(20, "姓名最多 20 字"),
  title: optionalText(40),
  className: optionalText(20),
  affiliation: optionalText(40),
  location: optionalText(30),
  headline: optionalText(60),
  bio: optionalText(20000),
  yearsExperience: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((value) => !value || (/^\d+$/.test(value) && Number(value) <= 60), "请输入 0-60 的数字"),
  email: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "请输入合法邮箱"),
  avatarUrl: urlOrPath,
});

export const timelineSchema = z.object({
  period: z.string().trim().min(1, "请填写时间").max(30, "时间最多 30 字"),
  title: z.string().trim().min(1, "请填写标题").max(60, "标题最多 60 字"),
  organization: optionalText(60),
  description: optionalText(120),
});

export const skillCategorySchema = z.object({
  name: z.string().trim().min(1, "分类名必填").max(30, "分类名最多 30 字"),
  slug: slugSchema,
  icon: optionalText(40),
});

export const skillSchema = z.object({
  categoryId: z.string().min(1, "请选择分类"),
  name: z.string().trim().min(1, "技能名必填").max(30, "技能名最多 30 字"),
  icon: optionalText(40),
  level: z.coerce.number().int().min(1, "熟练度范围为 1-5").max(5, "熟练度范围为 1-5"),
  years: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((value) => !value || (/^\d+$/.test(value) && Number(value) <= 60), "年限需为 0-60"),
  description: optionalText(60),
  learning: z.boolean().default(false),
});

const tagListSchema = z
  .array(z.string().trim().min(1).max(20, "单个标签最多 20 字"))
  .max(12, "最多 12 个标签")
  .default([]);

const dateString = z
  .string()
  .trim()
  .optional()
  .default("")
  .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), "日期格式不正确");

export const projectSchema = z.object({
  title: z.string().trim().min(1, "标题必填").max(80, "标题最多 80 字"),
  slug: slugSchema,
  summary: z.string().trim().min(1, "摘要必填").max(100, "摘要最多 100 字"),
  content: z.string().optional().default(""),
  coverUrl: urlOrPath,
  role: optionalText(40),
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]).default("PLANNED"),
  featured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  startDate: dateString,
  endDate: dateString,
  demoUrl: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((value) => !value || /^https?:\/\//.test(value), "请输入 http(s) 链接"),
  repoUrl: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((value) => !value || /^https?:\/\//.test(value), "请输入 http(s) 链接"),
  tags: tagListSchema,
  seoTitle: optionalText(60),
  seoDesc: optionalText(160),
  statusPublish: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  publishedAt: dateString,
  images: z
    .array(z.object({ url: z.string().trim().min(1), alt: z.string().trim().max(100).default("") }))
    .max(8, "最多 8 张截图")
    .default([]),
});

export const postSchema = z.object({
  title: z.string().trim().min(1, "标题必填").max(120, "标题最多 120 字"),
  slug: slugSchema,
  summary: optionalText(200),
  content: z.string().min(1, "正文不能为空"),
  coverUrl: urlOrPath,
  pinned: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]).default("DRAFT"),
  publishedAt: dateString,
  tags: tagListSchema,
  seoTitle: optionalText(60),
  seoDesc: optionalText(160),
});

export const contactSchema = z.object({
  name: z.string().trim().min(1, "请填写称呼").max(30, "称呼最多 30 字"),
  email: z.string().trim().min(1, "请填写邮箱").email("请输入合法邮箱"),
  subject: z.string().trim().max(60, "主题最多 60 字").optional().default(""),
  message: z
    .string()
    .trim()
    .min(10, "内容至少 10 个字")
    .max(2000, "内容最多 2000 字"),
  website: z.string().optional().default(""),
  startedAt: z.coerce.number().optional().default(0),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type SkillCategoryInput = z.infer<typeof skillCategorySchema>;
export type TimelineInput = z.infer<typeof timelineSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
