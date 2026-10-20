"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Emblem } from "@/components/site/emblem";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { ButtonLink, IconButton } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function HeaderBar({
  siteName,
  emblemUrl,
}: {
  siteName: string;
  emblemUrl: string | null;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-200",
        scrolled || open
          ? "border-b border-line bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container-page flex h-[68px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 rounded-md" aria-label={`${siteName} 首页`}>
          {emblemUrl ? (
            <Image
              src={emblemUrl}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-[6px] object-cover"
            />
          ) : (
            <Emblem size={32} />
          )}
          <span className="font-serif text-[1.0625rem] font-semibold tracking-wide">{siteName}</span>
        </Link>

        <nav aria-label="主导航" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-11 items-center rounded-[6px] px-3 text-sm transition-colors",
                  active ? "text-ink" : "text-muted hover:text-ink hover:bg-primary-soft",
                )}
              >
                {item.label}
                {active ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-3 -bottom-[15px] h-0.5 rounded-full"
                    style={{ backgroundColor: "var(--primary)" }}
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <ButtonLink href="/contact" size="sm" className="hidden sm:inline-flex">
            传讯
          </ButtonLink>
          <IconButton
            ref={triggerRef}
            label="打开导航菜单"
            className="md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(true)}
          >
            <Menu size={20} aria-hidden />
          </IconButton>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="导航菜单">
          <button
            type="button"
            aria-label="关闭菜单"
            className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-[2px]"
            onClick={() => {
              setOpen(false);
              triggerRef.current?.focus();
            }}
          />
          <div
            ref={panelRef}
            id="mobile-nav"
            className="absolute inset-y-0 right-0 flex w-[min(360px,88vw)] flex-col border-l border-line bg-bg p-5 shadow-lg"
            style={{ animation: "rise-in 300ms cubic-bezier(0.16,1,0.3,1) both" }}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-serif text-base font-semibold">
                <Emblem size={28} /> {siteName}
              </span>
              <IconButton
                ref={closeRef}
                label="关闭菜单"
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
              >
                <X size={20} aria-hidden />
              </IconButton>
            </div>
            <nav aria-label="移动端导航" className="mt-6 flex flex-col gap-1">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-12 items-center rounded-[8px] px-3 text-lg",
                    pathname.startsWith(item.href)
                      ? "bg-primary-soft font-medium text-primary"
                      : "text-ink hover:bg-primary-soft",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/contact"
                className="mt-2 flex h-12 items-center rounded-[8px] bg-primary px-3 text-lg font-medium text-[color:var(--primary-contrast)]"
              >
                传讯
              </Link>
            </nav>
            <p className="mt-auto text-xs leading-relaxed text-muted">
              一本持续更新的冒险者手账。
              <br />
              本站视觉风格致敬《无职转生》，与版权方无关联。
            </p>
          </div>
        </div>
      ) : null}
    </header>
  );
}
