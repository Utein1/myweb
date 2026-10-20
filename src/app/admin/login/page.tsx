import type { Metadata } from "next";
import Link from "next/link";
import { Emblem } from "@/components/site/emblem";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "登录 · 档案管理台",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/admin") ? next : "/admin";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <Emblem size={64} title="冒险者档案" />
          <h1 className="mt-5 font-serif text-2xl font-semibold">档案管理台</h1>
          <p className="mt-2 text-sm text-muted">只有站主可以进入，请使用预置账号登录。</p>
        </div>

        <div className="rounded-[12px] border border-line bg-surface p-6 shadow-sm">
          <LoginForm next={safeNext} />
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          <Link href="/" className="hover:text-ink">
            ← 返回站点
          </Link>
        </p>
      </div>
    </div>
  );
}
