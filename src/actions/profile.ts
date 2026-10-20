"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { guardAction } from "@/lib/auth";
import { str } from "@/lib/form";
import {
  fail,
  fieldErrors,
  ok,
  profileSchema,
  timelineSchema,
  type ActionResult,
} from "@/schemas";
import { revalidateSite } from "@/server/mutations/shared";

export async function saveProfileAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await guardAction();
  if (!guard.ok) return guard;

  const parsed = profileSchema.safeParse({
    displayName: str(formData, "displayName"),
    title: str(formData, "title"),
    className: str(formData, "className"),
    affiliation: str(formData, "affiliation"),
    location: str(formData, "location"),
    headline: str(formData, "headline"),
    bio: str(formData, "bio"),
    yearsExperience: str(formData, "yearsExperience"),
    email: str(formData, "email"),
    avatarUrl: str(formData, "avatarUrl"),
  });
  if (!parsed.success) return fieldErrors(parsed.error);

  const data = parsed.data;
  const payload = {
    displayName: data.displayName,
    title: data.title || null,
    className: data.className || null,
    affiliation: data.affiliation || null,
    location: data.location || null,
    headline: data.headline || null,
    bio: data.bio || null,
    yearsExperience: data.yearsExperience ? Number(data.yearsExperience) : null,
    email: data.email || null,
    avatarUrl: data.avatarUrl || null,
  };

  await prisma.profile.upsert({
    where: { id: "main" },
    update: payload,
    create: { id: "main", ...payload },
  });

  revalidateSite();
  return ok(null);
}

export async function saveTimelineAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await guardAction();
  if (!guard.ok) return guard;

  const parsed = timelineSchema.safeParse({
    period: str(formData, "period"),
    title: str(formData, "title"),
    organization: str(formData, "organization"),
    description: str(formData, "description"),
  });
  if (!parsed.success) return fieldErrors(parsed.error);

  const id = str(formData, "id");
  const payload = {
    period: parsed.data.period,
    title: parsed.data.title,
    organization: parsed.data.organization || null,
    description: parsed.data.description || null,
  };

  if (id) {
    await prisma.timelineEntry.update({ where: { id }, data: payload });
  } else {
    const last = await prisma.timelineEntry.findFirst({ orderBy: { sortOrder: "desc" } });
    await prisma.timelineEntry.create({
      data: { ...payload, sortOrder: (last?.sortOrder ?? 0) + 1 },
    });
  }

  revalidateSite();
  return ok(null);
}

export async function deleteTimelineAction(formData: FormData): Promise<void> {
  const guard = await guardAction();
  if (!guard.ok) return;
  const id = str(formData, "id");
  if (!id) return;
  await prisma.timelineEntry.delete({ where: { id } }).catch(() => null);
  revalidateSite();
  revalidatePath("/admin/profile");
}

export async function moveTimelineAction(formData: FormData): Promise<void> {
  const guard = await guardAction();
  if (!guard.ok) return;
  const id = str(formData, "id");
  const direction = str(formData, "direction");
  if (!id || (direction !== "up" && direction !== "down")) return;

  const items = await prisma.timelineEntry.findMany({ orderBy: [{ sortOrder: "asc" }] });
  const index = items.findIndex((item) => item.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= items.length) return;

  // D1 不支持事务，按顺序写入即可
  await prisma.timelineEntry.update({ where: { id: items[index].id }, data: { sortOrder: target + 1 } });
  await prisma.timelineEntry.update({ where: { id: items[target].id }, data: { sortOrder: index + 1 } });
  revalidateSite();
  revalidatePath("/admin/profile");
}

export async function uploadAvatarAction(formData: FormData): Promise<void> {
  const guard = await guardAction();
  if (!guard.ok) return;
  const url = str(formData, "avatarUrl");
  if (!url) return;
  await prisma.profile.update({ where: { id: "main" }, data: { avatarUrl: url } });
  revalidateSite();
  revalidatePath("/admin/profile");
}
