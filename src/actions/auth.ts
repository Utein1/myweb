"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { changePasswordSchema, loginSchema } from "@/schemas";
import { guardAction } from "@/lib/auth";
import { destroySession, loginWithCredentials, getSession } from "@/lib/auth";
import { str } from "@/lib/form";
import { fail, ok, type ActionResult } from "@/schemas";

export type LoginState = { error?: string } | null;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: str(formData, "email"),
    password: str(formData, "password"),
    remember: formData.get("remember") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "请输入邮箱与密码" };
  }

  const result = await loginWithCredentials(
    parsed.data.email,
    parsed.data.password,
    Boolean(parsed.data.remember),
  );
  if (!result.ok) return { error: result.message };

  const next = str(formData, "next");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

export async function changePasswordAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await guardAction();
  if (!guard.ok) return guard;

  const parsed = changePasswordSchema.safeParse({
    currentPassword: str(formData, "currentPassword"),
    newPassword: str(formData, "newPassword"),
    confirmPassword: str(formData, "confirmPassword"),
  });
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0].message);

  const session = await getSession();
  const user = session ? await prisma.adminUser.findUnique({ where: { id: session.sub } }) : null;
  if (!user) return fail("UNAUTHORIZED", "登录已过期，请重新登录");

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return fail("INVALID", "当前密码不正确", "currentPassword");

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.adminUser.update({ where: { id: user.id }, data: { passwordHash } });
  return ok(null);
}
