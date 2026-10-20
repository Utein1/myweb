import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FolderKanban, Search, X } from "lucide-react";
import { PageHeader } from "@/components/site/section-heading";
import { ProjectCard } from "@/components/site/project-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import { TagPill } from "@/components/ui/tag-pill";
import { buildMetadata } from "@/lib/seo";
import { PROJECT_STATUS, PROJECT_STATUS_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getPublishedProjects } from "@/server/queries/projects";
import { getSiteSettings } from "@/server/queries/site";

export const revalidate = 300;

type SearchParams = Promise<{ status?: string; tag?: string; q?: string; page?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const settings = await getSiteSettings();
  const params = await searchParams;
  const title = params.tag ? `委托 · ${params.tag}` : "委托档案";
  return buildMetadata(
    {
      title,
      description: "按状态与技术栈浏览的项目档案：背景、职责、方案与结果。",
      path: "/projects",
    },
    {
      siteName: settings.siteName,
      title: settings.defaultSeoTitle,
      description: settings.defaultSeoDesc,
      ogImage: settings.defaultOgImageUrl,
    },
  );
}

function buildHref(current: Record<string, string | undefined>, patch: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  const merged = { ...current, ...patch };
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `/projects?${query}` : "/projects";
}

export default async function ProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;

  const data = await getPublishedProjects({
    status: params.status,
    tag: params.tag,
    q: params.q,
    page: safePage,
  });

  if (data.total > 0 && safePage > data.totalPages) notFound();

  const current = { status: params.status, tag: params.tag, q: params.q };
  const hasFilters = Boolean(params.status || params.tag || params.q);

  return (
    <div className="container-page py-12 lg:py-16">
      <PageHeader
        eyebrow="委托档案"
        title="委托档案"
        description="每个项目都是一份档案：目标、约束、方案与结果。"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          <span>
            共 <strong className="font-medium text-ink">{data.total}</strong> 份委托
          </span>
          {hasFilters ? (
            <Link href="/projects" className="inline-flex items-center gap-1 hover:text-ink">
              <X size={13} aria-hidden />
              清除筛选
            </Link>
          ) : null}
        </div>
      </PageHeader>

      {/* 筛选 */}
      <div className="mt-8 flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="按状态筛选">
          <Link
            href={buildHref(current, { status: undefined, page: undefined })}
            className={cn(
              "caption inline-flex h-8 items-center rounded-full border px-3 transition-colors",
              !params.status
                ? "border-transparent bg-primary text-[color:var(--primary-contrast)]"
                : "border-line text-muted hover:border-line-strong hover:text-ink",
            )}
          >
            全部
          </Link>
          {PROJECT_STATUS_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={buildHref(current, {
                status: option.value,
                page: undefined,
              })}
              className={cn(
                "caption inline-flex h-8 items-center gap-1.5 rounded-full border px-3 transition-colors",
                params.status === option.value
                  ? "border-transparent bg-primary text-[color:var(--primary-contrast)]"
                  : "border-line text-muted hover:border-line-strong hover:text-ink",
              )}
            >
              {option.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {data.tags.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {data.tags.map((tag) => (
                <TagPill
                  key={tag.id}
                  href={buildHref(current, {
                    tag: params.tag === tag.slug ? undefined : tag.slug,
                    page: undefined,
                  })}
                  className={cn(
                    params.tag === tag.slug &&
                      "border-transparent bg-primary-soft font-medium text-primary",
                  )}
                >
                  {tag.name}
                </TagPill>
              ))}
            </div>
          ) : (
            <span />
          )}

          <form action="/projects" method="get" className="flex max-w-sm items-center gap-2">
            {params.status ? <input type="hidden" name="status" value={params.status} /> : null}
            {params.tag ? <input type="hidden" name="tag" value={params.tag} /> : null}
            <div className="relative flex-1">
              <Search
                size={15}
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <Input
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="搜索委托标题"
                aria-label="搜索委托"
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary" size="md">
              搜索
            </Button>
          </form>
        </div>
      </div>

      {/* 列表 */}
      {data.items.length > 0 ? (
        <div className="mt-9 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {data.items.map((project, index) => (
            <ProjectCard key={project.id} project={project} priority={index === 0} />
          ))}
        </div>
      ) : (
        <div className="mt-9">
          <EmptyState
            icon={<FolderKanban size={40} />}
            title="没有符合条件的委托"
            description="换个状态或标签，或者清除筛选查看全部。"
            action={
              hasFilters ? (
                <ButtonLink href="/projects" variant="secondary">
                  清除筛选
                </ButtonLink>
              ) : (
                <ButtonLink href="/contact">聊聊你的委托</ButtonLink>
              )
            }
          />
        </div>
      )}

      <Pagination
        basePath="/projects"
        page={data.page}
        totalPages={data.totalPages}
        params={current}
      />

      <p className="mt-8 text-center text-xs text-muted">
        状态说明：{PROJECT_STATUS.IN_PROGRESS.label}中的项目会持续更新手记与截图。
      </p>
    </div>
  );
}
