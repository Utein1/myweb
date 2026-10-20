"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { guardAction } from "@/lib/auth";
import { str } from "@/lib/form";

export async function markMessageAction(formData: FormData): Promise<void> {
  const guard = await guardAction();
  if (!guard.ok) return;
  const id = str(formData, "id");
  const read = str(formData, "read") === "1";
  if (!id) return;

  await prisma.contactMessage
    .update({ where: { id }, data: { readAt: read ? new Date() : null } })
    .catch(() => null);
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
  const guard = await guardAction();
  if (!guard.ok) return;
  const id = str(formData, "id");
  if (!id) return;
  await prisma.contactMessage.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}
