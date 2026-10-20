import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { cache } from "react";
import { prisma } from "@/lib/db";
import {
  REMEMBER_MAX_AGE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSession,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/session";

export async function createSession(user: { id: string; email: string; name: string | null }, remember: boolean) {
  const maxAge = remember ? REMEMBER_MAX_AGE : SESSION_MAX_AGE;
  const token = await signSession(
    { sub: user.id, email: user.email, name: user.name ?? undefined },
    maxAge,
  );
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
});

/** 页面级保护：未登录跳转登录页并记录返回路径 */
export async function requireAdmin(currentPath?: string) {
  const session = await getSession();
  if (!session) {
    const next = currentPath ? `?next=${encodeURIComponent(currentPath)}` : "";
    redirect(`/admin/login${next}`);
  }
  return session;
}

/** Server Action 级保护：返回结构化错误而不是重定向 */
export async function guardAction() {
  const session = await getSession();
  if (!session) {
    return {
      ok: false as const,
      error: { code: "UNAUTHORIZED", message: "登录已过期，请重新登录" },
    };
  }
  return { ok: true as const, session };
}

// ---------------------------------------------------------------------------
// 登录限流（进程内，单实例；生产可换数据库计数表）
// ---------------------------------------------------------------------------

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;
const attempts = new Map<string, number[]>();

function recentAttempts(ip: string) {
  const now = Date.now();
  const list = (attempts.get(ip) ?? []).filter((time) => now - time < LOGIN_WINDOW_MS);
  attempts.set(ip, list);
  return list;
}

export async function clientIp() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export type LoginResult =
  | { ok: true }
  | { ok: false; code: "INVALID" | "LOCKED" | "RATE_LIMITED"; message: string };

export async function loginWithCredentials(
  rawEmail: string,
  password: string,
  remember: boolean,
): Promise<LoginResult> {
  const email = rawEmail.trim().toLowerCase();
  const ip = await clientIp();

  if (recentAttempts(ip).length >= LOGIN_MAX_ATTEMPTS) {
    return { ok: false, code: "RATE_LIMITED", message: "尝试过于频繁，请 15 分钟后再试" };
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) {
    attempts.set(ip, [...recentAttempts(ip), Date.now()]);
    return { ok: false, code: "INVALID", message: "邮箱或密码不正确" };
  }

  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const minutes = Math.max(1, Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000));
    return { ok: false, code: "LOCKED", message: `账号已锁定，请 ${minutes} 分钟后重试` };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    attempts.set(ip, [...recentAttempts(ip), Date.now()]);
    const nextAttempts = user.failedAttempts + 1;
    const lock = nextAttempts >= 5;
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        failedAttempts: lock ? 0 : nextAttempts,
        lockedUntil: lock ? new Date(Date.now() + LOGIN_WINDOW_MS) : null,
      },
    });
    if (lock) {
      return { ok: false, code: "LOCKED", message: "失败次数过多，账号已锁定 15 分钟" };
    }
    return { ok: false, code: "INVALID", message: "邮箱或密码不正确" };
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
  attempts.delete(ip);
  await createSession(user, remember);
  return { ok: true };
}
