"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  FolderKanban,
  Gauge,
  ImageIcon,
  Inbox,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { Emblem } from "@/components/site/emblem";
import { IconButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MENU = [
  { href: "/admin", label: "仪表盘", icon: Gauge },
  { href: "/admin/settings", label: "站点设置", icon: Settings },
  { href: "/admin/profile", label: "个人信息", icon: UserRound },
  { href: "/admin/skills", label: "技能", icon: Sparkles },
  { href: "/admin/projects", label: "委托", icon: FolderKanban },
  { href: "/admin/posts", label: "手记", icon: BookOpen },
  { href: "/admin/media", label: "媒体库", icon: ImageIcon },
  { href: "/admin/messages", label: "传讯", icon: Inbox },
];

export function AdminShell({
  siteName,
  email,
  emblemUrl,
  unread,
  logoutAction,
  children,
}: {
  siteName: string;
  email: string;
  emblemUrl: string | null;
  unread: number;
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const nav = (
    <nav aria-label="后台导航" className="flex flex-col gap-0.5">
      {MENU.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-10 items-center gap-2.5 rounded-[8px] px-3 text-sm transition-colors",
              active
                ? "bg-primary-soft font-medium text-primary"
                : "text-muted hover:bg-primary-soft hover:text-ink",
            )}
          >
            <item.icon size={16} aria-hidden />
            {item.label}
            {item.href === "/admin/messages" && unread > 0 ? (
              <span
                className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.6875rem] font-medium"
                style={{ backgroundColor: "var(--warning)", color: "#fff" }}
              >
                {unread}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-bg">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col border-r border-line bg-surface/60 lg:flex">
        <div className="flex h-[72px] items-center gap-2.5 border-b border-line px-5">
          {emblemUrl ? (
            <img
              src={emblemUrl}
              alt=""
              width={30}
              height={30}
              className="h-[30px] w-[30px] rounded-[6px] object-cover"
            />
          ) : (
            <Emblem size={30} />
          )}
          <div className="min-w-0">
            <p className="truncate font-serif text-sm font-semibold">{siteName}</p>
            <p className="caption text-muted">档案管理台</p>
          </div>
        </div>
        <div className="admin-scroll flex-1 overflow-y-auto p-3">{nav}</div>
        <div className="border-t border-line p-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener"
            className="flex h-9 items-center gap-2 rounded-[8px] px-3 text-xs text-muted hover:bg-primary-soft hover:text-ink"
          >
            查看站点 ↗
          </Link>
          <p className="truncate px-3 py-1 text-[0.6875rem] text-muted">{email}</p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex h-9 w-full items-center gap-2 rounded-[8px] px-3 text-xs text-muted hover:bg-primary-soft hover:text-ink"
            >
              <LogOut size={14} aria-hidden />
              退出登录
            </button>
          </form>
        </div>
      </aside>

      <div className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-line bg-bg/90 px-4 backdrop-blur-md lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          {emblemUrl ? (
            <img src={emblemUrl} alt="" width={26} height={26} className="h-[26px] w-[26px] rounded-[6px] object-cover" />
          ) : (
            <Emblem size={26} />
          )}
          <span className="font-serif text-sm font-semibold">档案管理台</span>
        </Link>
        <IconButton label="打开后台导航" onClick={() => setOpen(true)}>
          <Menu size={20} aria-hidden />
        </IconButton>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="后台导航">
          <button
            type="button"
            aria-label="关闭导航"
            className="absolute inset-0 bg-[var(--overlay)]"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(300px,86vw)] flex-col border-r border-line bg-bg">
            <div className="flex h-[60px] items-center justify-between border-b border-line px-4">
              <span className="font-serif text-sm font-semibold">档案管理台</span>
              <IconButton label="关闭导航" onClick={() => setOpen(false)}>
                <X size={18} aria-hidden />
              </IconButton>
            </div>
            <div className="flex-1 overflow-y-auto p-3">{nav}</div>
            <div className="border-t border-line p-3">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex h-10 w-full items-center gap-2 rounded-[8px] px-3 text-sm text-muted hover:bg-primary-soft"
                >
                  <LogOut size={15} aria-hidden />
                  退出登录
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      <div className="lg:pl-[240px]">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-6 lg:px-8 lg:py-8">{children}</div>
      </div>
    </div>
  );
}
