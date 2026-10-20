import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarDays,
  Download,
  Mail,
  MapPin,
} from "lucide-react";
import { Emblem } from "@/components/site/emblem";
import { JsonLd } from "@/components/site/json-ld";
import { Prose } from "@/components/site/prose";
import { SocialLinks } from "@/components/site/social-links";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/site/section-heading";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";
import { getProfile, getPublicStats, getSiteSettings, getTimeline } from "@/server/queries/site";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [settings, profile] = await Promise.all([getSiteSettings(), getProfile()]);
  return buildMetadata(
    {
      title: `关于 ${profile?.displayName ?? ""}`.trim(),
      description: profile?.headline || settings.defaultSeoDesc,
      path: "/about",
    },
    {
      siteName: settings.siteName,
      title: settings.defaultSeoTitle,
      description: settings.defaultSeoDesc,
      ogImage: settings.defaultOgImageUrl,
    },
  );
}

async function resumeExists(url: string | null) {
  if (!url) return false;
  // 简历放在 public/ 或 R2 上都可以：只要配置了地址就展示下载入口
  return true;
}

export default async function AboutPage() {
  const [settings, profile, timeline, stats] = await Promise.all([
    getSiteSettings(),
    getProfile(),
    getTimeline(),
    getPublicStats(),
  ]);

  if (!profile) {
    return (
      <div className="container-page py-20">
        <PageHeader title="关于" description="登记卡尚未填写。" />
      </div>
    );
  }

  const { html } = profile.bio ? await renderMarkdown(profile.bio) : { html: "" };
  const hasResume = await resumeExists(settings.resumeUrl);

  const facts = [
    { icon: Briefcase, label: "职业", value: profile.className },
    { icon: Building2, label: "所属", value: profile.affiliation },
    { icon: MapPin, label: "所在地", value: profile.location },
    {
      icon: CalendarDays,
      label: "从业",
      value: profile.yearsExperience ? `${profile.yearsExperience} 年` : "",
    },
    { icon: Mail, label: "邮箱", value: profile.email, href: profile.email ? `mailto:${profile.email}` : undefined },
  ].filter((item) => item.value);

  const statItems = [
    profile.yearsExperience ? { label: "从业年限", value: `${profile.yearsExperience}`, unit: "年" } : null,
    { label: "完成委托", value: `${stats.projects}`, unit: "份" },
    { label: "公开手记", value: `${stats.posts}`, unit: "篇" },
  ].filter(Boolean) as { label: string; value: string; unit: string }[];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: profile.displayName,
          jobTitle: profile.className || profile.title,
          description: profile.headline,
          url: absoluteUrl("/about"),
          email: profile.email || undefined,
          sameAs: settings.socialLinks.filter((link) => /^https?:/.test(link.url)).map((link) => link.url),
        }}
      />

      <div className="container-page py-12 lg:py-16">
        <PageHeader eyebrow="登记卡" title="关于" description={profile.headline || undefined} />

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          {/* 登记卡 */}
          <section aria-labelledby="profile-card" className="lg:col-span-5">
            <div className="rounded-[12px] border border-line bg-surface p-6 lg:p-8">
              <div className="flex items-start gap-5">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={`${profile.displayName} 的头像`}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-[12px] object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-[12px] border border-line bg-surface2">
                    <Emblem size={64} />
                  </div>
                )}
                <div>
                  <h2 id="profile-card" className="font-serif text-2xl font-semibold">
                    {profile.displayName}
                  </h2>
                  {profile.title ? <p className="mt-1 text-sm text-muted">{profile.title}</p> : null}
                  {settings.socialLinks.length > 0 ? (
                    <SocialLinks links={settings.socialLinks} className="-ml-3 mt-2" size={17} />
                  ) : null}
                </div>
              </div>

              {facts.length > 0 ? (
                <dl className="mt-7 space-y-3 border-t border-line pt-6 text-sm">
                  {facts.map((fact) => (
                    <div key={fact.label} className="flex items-start gap-3">
                      <dt className="flex w-20 shrink-0 items-center gap-2 text-muted">
                        <fact.icon size={14} aria-hidden />
                        {fact.label}
                      </dt>
                      <dd className="min-w-0 break-words">
                        {fact.href ? (
                          <a href={fact.href} className="underline decoration-line underline-offset-4 hover:text-primary">
                            {fact.value}
                          </a>
                        ) : (
                          fact.value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {hasResume ? (
                <a
                  href={settings.resumeUrl ?? "#"}
                  download
                  className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-line text-sm font-medium transition-colors hover:border-line-strong"
                >
                  <Download size={16} aria-hidden />
                  下载简历 PDF
                </a>
              ) : null}
            </div>

            {statItems.length > 0 ? (
              <dl className="mt-6 grid grid-cols-3 divide-x divide-line rounded-[12px] border border-line bg-surface">
                {statItems.map((item) => (
                  <div key={item.label} className="px-4 py-5 text-center">
                    <dd className="font-serif text-2xl font-semibold" style={{ color: "var(--gold)" }}>
                      {item.value}
                      <span className="ml-0.5 text-xs font-normal text-muted">{item.unit}</span>
                    </dd>
                    <dt className="caption mt-1 text-muted">{item.label}</dt>
                  </div>
                ))}
              </dl>
            ) : null}
          </section>

          {/* 自述 */}
          <section className="lg:col-span-7" aria-labelledby="bio-title">
            <h2 id="bio-title" className="section-title">
              自述
            </h2>
            <div className="mt-5">
              {html ? (
                <Prose html={html} />
              ) : (
                <p className="text-sm text-muted">自述尚未填写。</p>
              )}
            </div>
          </section>
        </div>

        {/* 履历 */}
        {timeline.length > 0 ? (
          <section className="mt-16 border-t border-line pt-12" aria-labelledby="timeline-title">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">履历</p>
                <h2 id="timeline-title" className="section-title mt-2">
                  走过的路
                </h2>
              </div>
              <p className="caption text-muted">最近 {timeline.length} 段经历</p>
            </div>

            <ol className="mt-8">
              {timeline.map((entry, index) => (
                <li key={entry.id} className="relative grid gap-1 pb-10 md:grid-cols-[96px_1fr] md:gap-8">
                  <div className="caption pt-0.5 font-mono text-muted md:text-right">
                    {entry.period}
                  </div>
                  <div className="relative border-l border-line pl-6 md:pl-8">
                    <span
                      aria-hidden
                      className="absolute -left-[4.5px] top-2 h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: index === 0 ? "var(--gold)" : "var(--border-strong)",
                      }}
                    />
                    <h3 className="font-serif text-lg font-medium">{entry.title}</h3>
                    {entry.organization ? (
                      <p className="mt-0.5 text-sm text-muted">{entry.organization}</p>
                    ) : null}
                    {entry.description ? (
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                        {entry.description}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[12px] border border-line bg-surface px-6 py-5">
          <p className="text-sm text-muted">想聊合作、技术，或只是打个招呼？</p>
          <div className="flex gap-2">
            <ButtonLink href="/contact" variant="secondary" size="sm">
              传讯
              <ArrowRight size={15} aria-hidden />
            </ButtonLink>
            <ButtonLink href="/projects" size="sm">
              查看委托
            </ButtonLink>
          </div>
        </div>
      </div>
    </>
  );
}
