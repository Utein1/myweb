"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { guardAction } from "@/lib/auth";
import { bool, str } from "@/lib/form";
import {
  fail,
  fieldErrors,
  ok,
  skillCategorySchema,
  skillSchema,
  type ActionResult,
} from "@/schemas";
import { revalidateSite } from "@/server/mutations/shared";

export async function saveSkillCategoryAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await guardAction();
  if (!guard.ok) return guard;

  const parsed = skillCategorySchema.safeParse({
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    icon: str(formData, "icon"),
  });
  if (!parsed.success) return fieldErrors(parsed.error);

  const id = str(formData, "id");
  const duplicate = await prisma.skillCategory.findUnique({ where: { slug: parsed.data.slug } });
  if (duplicate && duplicate.id !== id) {
    return fail("DUPLICATE", "该标识已存在", "slug");
  }

  const payload = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    icon: parsed.data.icon || null,
  };

  if (id) {
    await prisma.skillCategory.update({ where: { id }, data: payload });
  } else {
    const last = await prisma.skillCategory.findFirst({ orderBy: { sortOrder: "desc" } });
    await prisma.skillCategory.create({
      data: { ...payload, sortOrder: (last?.sortOrder ?? 0) + 1 },
    });
  }

  revalidateSite();
  revalidatePath("/admin/skills");
  return ok(null);
}

export async function deleteSkillCategoryAction(formData: FormData): Promise<void> {
  const guard = await guardAction();
  if (!guard.ok) return;
  const id = str(formData, "id");
  const force = bool(formData, "force");
  if (!id) return;

  const count = await prisma.skill.count({ where: { categoryId: id } });
  if (count > 0 && !force) return;

  await prisma.skillCategory.delete({ where: { id } }).catch(() => null);
  revalidateSite();
  revalidatePath("/admin/skills");
}

export async function saveSkillAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await guardAction();
  if (!guard.ok) return guard;

  const parsed = skillSchema.safeParse({
    categoryId: str(formData, "categoryId"),
    name: str(formData, "name"),
    icon: str(formData, "icon"),
    level: str(formData, "level"),
    years: str(formData, "years"),
    description: str(formData, "description"),
    learning: bool(formData, "learning"),
  });
  if (!parsed.success) return fieldErrors(parsed.error);

  const id = str(formData, "id");
  const category = await prisma.skillCategory.findUnique({
    where: { id: parsed.data.categoryId },
  });
  if (!category) return fail("VALIDATION", "所选分类不存在", "categoryId");

  const payload = {
    categoryId: parsed.data.categoryId,
    name: parsed.data.name,
    icon: parsed.data.icon || null,
    level: parsed.data.level,
    years: parsed.data.years ? Number(parsed.data.years) : null,
    description: parsed.data.description || null,
    learning: parsed.data.learning,
  };

  if (id) {
    await prisma.skill.update({ where: { id }, data: payload });
  } else {
    const last = await prisma.skill.findFirst({
      where: { categoryId: parsed.data.categoryId },
      orderBy: { sortOrder: "desc" },
    });
    await prisma.skill.create({ data: { ...payload, sortOrder: (last?.sortOrder ?? 0) + 1 } });
  }

  revalidateSite();
  revalidatePath("/admin/skills");
  return ok(null);
}

export async function deleteSkillAction(formData: FormData): Promise<void> {
  const guard = await guardAction();
  if (!guard.ok) return;
  const id = str(formData, "id");
  if (!id) return;
  await prisma.skill.delete({ where: { id } }).catch(() => null);
  revalidateSite();
  revalidatePath("/admin/skills");
}

export async function moveSkillAction(formData: FormData): Promise<void> {
  const guard = await guardAction();
  if (!guard.ok) return;
  const id = str(formData, "id");
  const direction = str(formData, "direction");
  const skill = await prisma.skill.findUnique({ where: { id } });
  if (!skill || (direction !== "up" && direction !== "down")) return;

  const siblings = await prisma.skill.findMany({
    where: { categoryId: skill.categoryId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  const index = siblings.findIndex((item) => item.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= siblings.length) return;

  // D1 不支持事务，按顺序写入即可（排序冲突最坏情况下重新排序）
  await prisma.skill.update({ where: { id: siblings[index].id }, data: { sortOrder: target + 1 } });
  await prisma.skill.update({ where: { id: siblings[target].id }, data: { sortOrder: index + 1 } });
  revalidateSite();
  revalidatePath("/admin/skills");
}
