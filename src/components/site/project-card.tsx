import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CoverArt } from "@/components/site/cover-art";
import { ProjectStatusBadge } from "@/components/site/status-badge";
import { TagPill } from "@/components/ui/tag-pill";
import { formatYear } from "@/lib/format";
import type { ProjectListItem } from "@/server/queries/projects";

export function ProjectCard({ project, priority }: { project: ProjectListItem; priority?: boolean }) {
  const tags = project.tags.map((item) => item.tag);
  const year = project.startDate
    ? formatYear(project.startDate)
    : project.publishedAt
      ? formatYear(project.publishedAt)
      : "";

  return (
    <article>
      <Link
        href={`/projects/${project.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-[12px] border border-line bg-surface transition-colors duration-250 hover:border-line-strong"
      >
        <div className="relative">
          <CoverArt
            src={project.coverUrl}
            title={project.title}
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 92vw"
            priority={priority}
            className="rounded-none border-0 border-b border-line"
          />
          <div className="absolute right-3 top-3">
            <ProjectStatusBadge status={project.status} />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5 lg:p-6">
          <div className="flex items-center gap-2 text-xs text-muted">
            {year ? <span className="font-mono">{year}</span> : null}
            {year && project.role ? <span aria-hidden className="opacity-40">/</span> : null}
            {project.role ? <span>{project.role}</span> : null}
          </div>
          <h3 className="mt-2 flex items-start justify-between gap-3 font-serif text-[1.375rem] font-medium leading-snug">
            <span>{project.title}</span>
            <ArrowUpRight
              size={18}
              aria-hidden
              className="mt-1 shrink-0 text-muted transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{project.summary}</p>
          {tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tags.slice(0, 4).map((tag) => (
                <TagPill key={tag.id}>{tag.name}</TagPill>
              ))}
              {tags.length > 4 ? <TagPill>+{tags.length - 4}</TagPill> : null}
            </div>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
