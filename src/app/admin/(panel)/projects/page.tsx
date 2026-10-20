import Link from "next/link";
import { ExternalLink, Plus, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/panel";
import { DeleteForm } from "@/components/admin/submit-button";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/field";
import { TagPill } from "@/components/ui/tag-pill";
import { PROJECT_STATUS, PROJECT_STATUS_OPTIONS } from "@/lib/constants";
import { formatDateTime, formatDateShort } from "@/lib/format";
import { getAdminProjects } from "@/server/queries/projects";
import { deleteProjectAction } from "@/actions/projects";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status = "ALL", q = "" } = await searchParams;
  const projects = await getAdminProjects({ status, q });

  const statusTabs = [{ value: "ALL", label: "全部" }, ...PROJECT_STATUS_OPTIONS];

  return (
    <>
      <AdminPageHeader
        eyebrow="Commissions"
        title="委托管理"
        description="每一份委托是一份档案：封面、摘要、正文与截图。草稿不会出现在前台。"
        actions={
          <ButtonLink href="/admin/projects/new" size="sm">
            <Plus size={15} aria-hidden />
            新建委托
          </ButtonLink>
        }
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-1.5" aria-label="按状态筛选">
          {statusTabs.map((tab) => {
            const active = status === tab.value;
            const href =
              tab.value === "ALL"
                ? q
                  ? `/admin/projects?q=${encodeURIComponent(q)}`
                  : "/admin/projects"
                : `/admin/projects?status=${tab.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
            return (
              <Link
                key={tab.value}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-8 items-center rounded-full border px-3 text-xs transition-colors",
                  active
                    ? "border-transparent bg-primary text-[color:var(--primary-contrast)]"
                    : "border-line text-muted hover:border-line-strong hover:text-ink",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <form action="/admin/projects" method="get" className="flex items-center gap-2">
          {status !== "ALL" ? <input type="hidden" name="status" value={status} /> : null}
          <label htmlFor="project-search" className="sr-only">
            搜索委托
          </label>
          <div className="relative">
            <Search
              size={15}
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <Input
              id="project-search"
              name="q"
              defaultValue={q}
              placeholder="搜索标题或标识"
              className="w-[200px] pl-9"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-[8px] border border-line px-3 text-sm hover:border-line-strong"
          >
            搜索
          </button>
        </form>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title={q || status !== "ALL" ? "没有符合条件的委托" : "还没有委托"}
          description={
            q || status !== "ALL"
              ? "试试清除筛选条件，或换一个关键词。"
              : "新建第一份委托，把封面、摘要和正文填上。"
          }
          action={
            q || status !== "ALL" ? (
              <ButtonLink href="/admin/projects" variant="secondary" size="sm">
                清除筛选
              </ButtonLink>
            ) : (
              <ButtonLink href="/admin/projects/new" size="sm">
                <Plus size={15} aria-hidden />
                新建委托
              </ButtonLink>
            )
          }
        />
      ) : (
        <ul className="divide-y divide-[color:var(--border)] rounded-[12px] border border-line bg-surface">
          {projects.map((project) => {
            const meta = PROJECT_STATUS[project.status] ?? PROJECT_STATUS.PLANNED;
            return (
              <li key={project.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="h-[54px] w-24 shrink-0 overflow-hidden rounded-[6px] border border-line bg-surface2">
                  {project.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={project.coverUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-[0.625rem] text-muted">
                      无封面
                    </span>
                  )}
                </div>

                <div className="min-w-[180px] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {project.title}
                    </Link>
                    <Badge tone={meta.tone} dot>
                      {meta.label}
                    </Badge>
                    {project.featured ? <Badge tone="warning">精选</Badge> : null}
                    {project.publishedAt ? (
                      <Badge tone="success">已发布</Badge>
                    ) : (
                      <Badge tone="muted">草稿</Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="caption text-muted">/projects/{project.slug}</span>
                    {project.tags.slice(0, 4).map(({ tag }) => (
                      <TagPill key={tag.id}>{tag.name}</TagPill>
                    ))}
                    {project.tags.length > 4 ? (
                      <span className="caption text-muted">+{project.tags.length - 4}</span>
                    ) : null}
                  </div>
                </div>

                <div className="caption w-[110px] shrink-0 text-muted">
                  <p>更新 {formatDateShort(project.updatedAt)}</p>
                  <p className="mt-0.5">{formatDateTime(project.updatedAt).split(" ")[1]}</p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="inline-flex h-9 items-center rounded-[8px] px-2 text-xs text-muted hover:bg-primary-soft hover:text-ink"
                  >
                    编辑
                  </Link>
                  {project.publishedAt ? (
                    <Link
                      href={`/projects/${project.slug}`}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex h-9 items-center gap-1 rounded-[8px] px-2 text-xs text-muted hover:bg-primary-soft hover:text-ink"
                    >
                      <ExternalLink size={13} aria-hidden />
                      前台
                    </Link>
                  ) : null}
                  <DeleteForm
                    action={deleteProjectAction}
                    id={project.id}
                    confirmText={`确定删除「${project.title}」吗？图集与标签关系会一并删除，媒体文件保留。`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
