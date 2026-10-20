"use server";

import { prisma } from "@/lib/db";
import { guardAction } from "@/lib/auth";
import { json, str } from "@/lib/form";
import { fail, fieldErrors, ok, settingsSchema, type ActionResult } from "@/schemas";
import { revalidateSite } from "@/server/mutations/shared";
import type { SocialLink } from "@/lib/constants";

export async function saveSiteSettings(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await guardAction();
  if (!guard.ok) return guard;

  const parsed = settingsSchema.safeParse({
    siteName: str(formData, "siteName"),
    tagline: str(formData, "tagline"),
    emblemUrl: str(formData, "emblemUrl"),
    primaryColor: str(formData, "primaryColor"),
    defaultSeoTitle: str(formData, "defaultSeoTitle"),
    defaultSeoDesc: str(formData, "defaultSeoDesc"),
    defaultOgImageUrl: str(formData, "defaultOgImageUrl"),
    socialLinks: json<SocialLink[]>(formData, "socialLinks", []),
    footerText: str(formData, "footerText"),
    icpNumber: str(formData, "icpNumber"),
    resumeUrl: str(formData, "resumeUrl"),
    rssMode: str(formData, "rssMode") || "SUMMARY",
  });
  if (!parsed.success) return fieldErrors(parsed.error);

  const data = parsed.data;
  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: {
      siteName: data.siteName,
      tagline: data.tagline || null,
      emblemUrl: data.emblemUrl || null,
      primaryColor: data.primaryColor.toUpperCase(),
      defaultSeoTitle: data.defaultSeoTitle || null,
      defaultSeoDesc: data.defaultSeoDesc || null,
      defaultOgImageUrl: data.defaultOgImageUrl || null,
      socialLinks: JSON.stringify(data.socialLinks),
      footerText: data.footerText || null,
      icpNumber: data.icpNumber || null,
      resumeUrl: data.resumeUrl || null,
      rssMode: data.rssMode,
    },
    create: {
      id: "singleton",
      siteName: data.siteName,
      tagline: data.tagline || null,
      emblemUrl: data.emblemUrl || null,
      primaryColor: data.primaryColor.toUpperCase(),
      defaultSeoTitle: data.defaultSeoTitle || null,
      defaultSeoDesc: data.defaultSeoDesc || null,
      defaultOgImageUrl: data.defaultOgImageUrl || null,
      socialLinks: JSON.stringify(data.socialLinks),
      footerText: data.footerText || null,
      icpNumber: data.icpNumber || null,
      resumeUrl: data.resumeUrl || null,
      rssMode: data.rssMode,
    },
  });

  revalidateSite();
  return ok(null);
}

export async function saveAccount(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await guardAction();
  if (!guard.ok) return guard;

  const name = str(formData, "name").trim();
  if (name.length > 40) return fail("VALIDATION", "显示名最多 40 字", "name");

  await prisma.adminUser.update({
    where: { id: guard.session.sub },
    data: { name: name || null },
  });
  return ok(null);
}
