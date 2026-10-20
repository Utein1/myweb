import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { Emblem } from "@/components/site/emblem";
import { JsonLd } from "@/components/site/json-ld";
import { PostRow } from "@/components/site/post-row";
import { ProjectCard } from "@/components/site/project-card";
import { SectionHeading } from "@/components/site/section-heading";
import { SocialLinks } from "@/components/site/social-links";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { absoluteUrl } from "@/lib/utils";
import { skillLevelName } from "@/lib/constants";
import { getSiteSettings, getProfile, getPublicStats } from "@/server/queries/site";
import { getFeaturedProjects } from "@/server/queries/projects";
import { getLatestPosts } from "@/server/queries/posts";
import { getTopSkills } from "@/server/queries/skills";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata(
    { path: "/", absoluteTitle: true },
    {
      siteName: settings.siteName,
      title: settings.defaultSeoTitle || `${settings.siteName} — 个人站`,
      description: settings.defaultSeoDesc || settings.tagline,
      ogImage: settings.defaultOgImageUrl,
    },
  );
}

export default async function HomePage() {
  const [settings, profile, topSkills, featured, latest, stats] = await Promise.all([
    getSiteSettings(),
    getProfile(),
    getTopSkills(6),
    getFeaturedProjects(3),
    getLatestPosts(3),
    getPublicStats(),
  ]);

  const name = profile?.displayName ?? "未署名";
  const title = profile?.title || profile?.className || "独立开发者";
  const headline = profile?.headline || "记录作品、技能与思考。";

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name,
          jobTitle: profile?.className || title,
          description: headline,
          url: absoluteUrl("/"),
          email: profile?.email ? `mailto:${profile.email}` : undefined,
          sameAs: settings.socialLinks
            .filter((link) => /^https?:/.test(link.url))
            .map((link) => link.url),
        }}
      />

      {/* 首屏 */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-24 hidden h-[520px] w-[520px] lg:block"
          style={{ opacity: 0.06 }}
        >
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <circle cx="100" cy="100" r="96" fill="none" stroke="var(--gold)" strokeWidth="0.6" />
            <circle cx="100" cy="100" r="78" fill="none" stroke="var(--gold)" strokeWidth="0.4" strokeDasharray="1 6" />
            <circle cx="100" cy="100" r="58" fill="none" stroke="var(--primary)" strokeWidth="0.5" />
            <path d="M100 4 L196 100 L100 196 L4 100 Z" fill="none" stroke="var(--gold)" strokeWidth="0.5" />
            <path d="M100 40 L154 100 L100 160 L46 100 Z" fill="none" stroke="var(--primary)" strokeWidth="0.5" />
            <path d="M100 4 V196 M4 100 H196" stroke="var(--gold)" strokeWidth="0.3" />
          </svg>
        </div>

        <div className="container-page grid gap-12 pb-16 pt-10 lg:grid-cols-12 lg:items-center lg:pb-28 lg:pt-16">
          <div className="rise-in lg:col-span-7">
            <div className="mb-6 lg:hidden">
              <Emblem size={64} title={settings.siteName} />
            </div>
            <p className="eyebrow">
              <span aria-hidden style={{ color: "var(--gold)" }}>
                ✦
              </span>
              {title}
            </p>
            <h1 className="display-title mt-4">{name}</h1>
            <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-muted">{headline}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/projects" size="lg">
                查看委托
                <ArrowRight size={17} aria-hidden />
              </ButtonLink>
              <ButtonLink href="/blog" variant="secondary" size="lg">
                阅读手记
              </ButtonLink>
            </div>

            <div className="mt-7 flex items-center gap-4">
              <SocialLinks links={settings.socialLinks} className="-ml-3" />
              {settings.socialLinks.length > 0 ? (
                <span aria-hidden className="h-4 w-px bg-line" />
              ) : null}
              <p className="caption text-muted">
                {stats.projects} 份委托 · {stats.posts} 篇手记
              </p>
            </div>
          </div>

          <div className="rise-in-delay hidden lg:col-span-5 lg:block">
            <div className="relative mx-auto flex aspect-square w-full max-w-[340px] items-center justify-center">
              <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
                <circle cx="100" cy="100" r="92" fill="none" stroke="var(--border)" />
                <circle
                  cx="100"
                  cy="100"
                  r="76"
                  fill="none"
                  stroke="var(--gold)"
                  strokeOpacity="0.35"
                  strokeDasharray="2 8"
                />
                <path d="M100 8 V192 M8 100 H192" stroke="var(--border)" />
              </svg>
              <Emblem size={168} title={`${settings.siteName} 徽记`} />
              <div className="absolute inset-x-0 -bottom-2 text-center">
                <p className="caption text-muted">
                  {profile?.affiliation || "独立开发者"} · {profile?.location || "远程"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 能力速览 */}
      {topSkills.length > 0 ? (
        <section className="section border-t border-line" aria-labelledby="overview-title">
          <div className="container-page">
            <SectionHeading
              eyebrow="能力速览"
              title="顺手使用的工具"
              description="熟练度 ≥ 专精的技能，完整技能树见「技能」页。"
              action={{ href: "/skills", label: "查看技能树" }}
            />
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topSkills.map((skill) => (
                <li key={skill.id}>
                  <Link
                    href={`/skills#${skill.category.slug}`}
                    className="group flex items-center justify-between gap-4 rounded-[12px] border border-line bg-surface px-5 py-4 transition-colors hover:border-line-strong"
                  >
                    <span>
                      <span className="block text-[0.9375rem] font-medium">{skill.name}</span>
                      <span className="caption mt-0.5 block text-muted">
                        {skill.category.name} · {skillLevelName(skill.level)}
                      </span>
                    </span>
                    <ArrowRight
                      size={16}
                      aria-hidden
                      className="text-muted transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* 精选委托 */}
      {featured.length > 0 ? (
        <section className="section border-t border-line" aria-labelledby="featured-title">
          <div className="container-page">
            <SectionHeading
              eyebrow="委托档案"
              title="精选委托"
              description="最近完成或正在推进的项目。"
              action={{ href: "/projects", label: "全部委托" }}
            />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featured.map((project, index) => (
                <ProjectCard key={project.id} project={project} priority={index === 0} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 最新手记 */}
      <section className="section border-t border-line" aria-labelledby="latest-title">
        <div className="container-page grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              eyebrow="手记"
              title="最近在想什么"
              description="关于工程实践、设计与长期维护的零散记录。"
              action={{ href: "/blog", label: "全部手记" }}
            />
          </div>
          <div className="lg:col-span-8">
            {latest.length > 0 ? (
              <div className="border-t border-line">
                {latest.map((post) => (
                  <PostRow key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="尚未记录手记"
                description="新的手记会出现在这里。"
                action={<ButtonLink href="/blog">查看手记页</ButtonLink>}
              />
            )}
          </div>
        </div>
      </section>

      {/* 联络 */}
      <section className="section border-t border-line">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[12px] border border-line bg-surface px-6 py-12 text-center lg:px-16 lg:py-16">
            <div aria-hidden className="absolute -right-10 -top-10 opacity-[0.07]">
              <Emblem size={220} />
            </div>
            <p className="eyebrow justify-center">传讯</p>
            <h2 className="section-title mt-3">有委托，或只是想聊聊？</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted">
              项目合作、技术交流、内推机会都欢迎。留下你的联系方式和想聊的内容，我会尽快回复。
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="/contact" size="lg">
                <Mail size={16} aria-hidden />
                发送传讯
              </ButtonLink>
              {profile?.email ? (
                <a
                  href={`mailto:${profile.email}`}
                  className="text-sm text-muted underline decoration-line underline-offset-4 hover:text-ink"
                >
                  {profile.email}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
