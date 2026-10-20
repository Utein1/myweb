import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, Github, PlayCircle } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { TagPill } from "@/components/ui/tag-pill";
import { JsonLd } from "@/components/site/json-ld";
import { Prose } from "@/components/site/prose";
import { ProjectCard } from "@/components/site/project-card";
import { ProjectMedia } from "@/components/site/project-media";
import { ProjectStatusBadge } from "@/components/site/status-badge";
import { buildMetadata } from "@/lib/seo";
import { formatMonth } from "@/lib/format";
import { absoluteUrl } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";
import {
  getAdjacentProjects,
  getProjectBySlug,
  getRelatedProjects,
} from "@/server/queries/projects";
import { getSiteSettings } from "@/server/queries/site";

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const [project, settings] = await Promise.all([getProjectBySlug(slug), getSiteSettings()]);
  if (!project) return { title: "委托不存在" };
  return buildMetadata(
    {
      title: project.seoTitle || project.title,
      description: project.seoDesc || project.summary,
      path: `/projects/${project.slug}`,
      image: project.coverUrl,
      type: "article",
      publishedTime: project.publishedAt,
      modifiedTime: project.updatedAt,
    },
    {
      siteName: settings.siteName,
      title: settings.defaultSeoTitle,
      description: settings.defaultSeoDesc,
      ogImage: settings.defaultOgImageUrl,
    },
  );
}

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const { html } = project.content ? await renderMarkdown(project.content) : { html: "" };
  const tagIds = project.tags.map((item) => item.tagId);
  const [{ previous, next }, related] = await Promise.all([
    getAdjacentProjects(project.id),
    getRelatedProjects(project.id, tagIds, 3),
  ]);

  const period = project.startDate
    ? `${formatMonth(project.startDate)} — ${project.endDate ? formatMonth(project.endDate) : "至今"}`
    : null;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "委托", item: absoluteUrl("/projects") },
            {
              "@type": "ListItem",
              position: 2,
              name: project.title,
              item: absoluteUrl(`/projects/${project.slug}`),
            },
          ],
        }}
      />

      <article className="container-page py-10 lg:py-14">
        <div className="flex items-center justify-between gap-4">
          <Breadcrumb
            items={[
              { label: "委托", href: "/projects" },
              { label: project.title },
            ]}
          />
          <Link
            href="/projects"
            className="inline-flex h-9 items-center gap-1.5 rounded-[8px] px-2 text-xs text-muted hover:bg-primary-soft hover:text-ink"
          >
            <ArrowLeft size={14} aria-hidden />
            返回列表
          </Link>
        </div>

        <header className="mt-6 max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <ProjectStatusBadge status={project.status} />
            <span className="caption font-mono text-muted">{period ?? ""}</span>
            {project.role ? (
              <>
                <span aria-hidden className="text-muted opacity-40">
                  /
                </span>
                <span className="caption text-muted">{project.role}</span>
              </>
            ) : null}
          </div>
          <h1 className="display-title mt-4">{project.title}</h1>
          <p className="mt-4 max-w-3xl text-[1.0625rem] leading-relaxed text-muted">
            {project.summary}
          </p>
        </header>

        <div className="mt-8">
          <ProjectMedia
            title={project.title}
            coverUrl={project.coverUrl}
            images={project.images.map((image) => ({
              id: image.id,
              url: image.url,
              alt: image.alt,
            }))}
          />
        </div>

        {/* 摘要卡 */}
        <div className="mt-8 grid gap-6 rounded-[12px] border border-line bg-surface p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:p-8">
          <div>
            <p className="caption text-muted">摘要</p>
            <p className="mt-2 text-[0.9375rem] leading-relaxed">{project.summary}</p>
            {project.tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.tags.map(({ tag }) => (
                  <TagPill key={tag.id} href={`/projects?tag=${tag.slug}`}>
                    {tag.name}
                  </TagPill>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {project.demoUrl ? (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-[8px] bg-primary px-4 text-sm font-medium text-[color:var(--primary-contrast)] hover:brightness-[0.94]"
              >
                <PlayCircle size={16} aria-hidden />
                在线演示
              </a>
            ) : null}
            {project.repoUrl ? (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-[8px] border border-line px-4 text-sm font-medium hover:border-line-strong"
              >
                <Github size={16} aria-hidden />
                源码仓库
                <ExternalLink size={13} aria-hidden className="text-muted" />
              </a>
            ) : null}
          </div>
        </div>

        {html ? (
          <div className="mt-10 max-w-[720px]">
            <Prose html={html} />
          </div>
        ) : null}

        {/* 上一份 / 下一份 */}
        <nav
          className="mt-16 grid gap-3 border-t border-line pt-8 sm:grid-cols-2"
          aria-label="委托导航"
        >
          {previous ? (
            <Link
              href={`/projects/${previous.slug}`}
              className="group rounded-[12px] border border-line p-5 transition-colors hover:border-line-strong"
            >
              <span className="caption flex items-center gap-1.5 text-muted">
                <ArrowLeft size={13} aria-hidden />
                上一份委托
              </span>
              <span className="mt-2 block font-serif text-lg group-hover:text-primary">
                {previous.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/projects/${next.slug}`}
              className="group rounded-[12px] border border-line p-5 text-right transition-colors hover:border-line-strong sm:col-start-2"
            >
              <span className="caption flex items-center justify-end gap-1.5 text-muted">
                下一份委托
                <ArrowRight size={13} aria-hidden />
              </span>
              <span className="mt-2 block font-serif text-lg group-hover:text-primary">
                {next.title}
              </span>
            </Link>
          ) : null}
        </nav>
      </article>

      {related.length > 0 ? (
        <section className="container-page border-t border-line py-12" aria-labelledby="related-title">
          <h2 id="related-title" className="section-title">
            相关委托
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {related.map((item) => (
              <ProjectCard key={item.id} project={item} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
