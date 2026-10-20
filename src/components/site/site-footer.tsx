import Link from "next/link";
import { Rss } from "lucide-react";
import { Emblem } from "@/components/site/emblem";
import { SocialLinks } from "@/components/site/social-links";
import { NAV_LINKS } from "@/lib/constants";
import { getSiteSettings } from "@/server/queries/site";

export async function SiteFooter() {
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-line bg-surface/40">
      <div className="container-page py-12 lg:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Emblem size={34} />
              <span className="font-serif text-base font-semibold">{settings.siteName}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {settings.tagline || "一本持续更新的冒险者手账。"}
            </p>
            <div className="mt-3 flex items-center gap-3 text-xs text-muted">
              <a
                href="/rss.xml"
                className="inline-flex items-center gap-1.5 hover:text-ink"
                aria-label="订阅 RSS"
              >
                <Rss size={14} aria-hidden /> RSS
              </a>
              <span aria-hidden className="opacity-40">
                /
              </span>
              <Link href="/blog/archive" className="hover:text-ink">
                归档
              </Link>
            </div>
          </div>

          <nav aria-label="页脚导航">
            <p className="caption mb-3 text-muted">浏览</p>
            <ul className="space-y-1 text-sm">
              {NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex h-9 items-center text-muted transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/contact"
                  className="inline-flex h-9 items-center text-muted transition-colors hover:text-ink"
                >
                  传讯
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <p className="caption mb-3 text-muted">联络</p>
            <SocialLinks links={settings.socialLinks} className="-ml-3" />
            <p className="mt-4 text-xs leading-relaxed text-muted">{settings.footerText}</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {settings.siteName}
            {settings.icpNumber ? (
              <>
                <span aria-hidden className="mx-2 opacity-40">
                  /
                </span>
                <a
                  href="https://beian.miit.gov.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink"
                >
                  {settings.icpNumber}
                </a>
              </>
            ) : null}
          </p>
          <p className="text-muted">
            本站视觉风格致敬《无职转生》，与版权方无关联。
          </p>
        </div>
      </div>
    </footer>
  );
}
