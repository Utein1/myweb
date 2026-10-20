import Link from "next/link";
import { ExternalLink, Plus, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/panel";
import { DeleteForm } from "@/components/admin/submit-button";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/field";
import { TagPill } from "@/components/ui/tag-pill";
import { POST_STATUS, POST_STATUS_OPTIONS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { getAdminPosts } from "@/server/queries/posts";
import { deletePostAction } from "@/actions/posts";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status = "ALL", q = "" } = await searchParams;
  const posts = await getAdminPosts({ status, q });

  const statusTabs = [{ value: "ALL", label: "全部" }, ...POST_STATUS_OPTIONS];

  return (
    <>
      <AdminPageHeader
        eyebrow="Journal"
        title="手记管理"
        description="草稿、发布与定时发布都在这里。发布后前台缓存立即刷新。"
        actions={
          <ButtonLink href="/admin/posts/new" size="sm">
            <Plus size={15} aria-hidden />
            新建手记
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
                  ? `/admin/posts?q=${encodeURIComponent(q)}`
                  : "/admin/posts"
                : `/admin/posts?status=${tab.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
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

        <form action="/admin/posts" method="get" className="flex items-center gap-2">
          {status !== "ALL" ? <input type="hidden" name="status" value={status} /> : null}
          <label htmlFor="post-search" className="sr-only">
            搜索手记
          </label>
          <div className="relative">
            <Search
              size={15}
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <Input
              id="post-search"
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

      {posts.length === 0 ? (
        <EmptyState
          title={q || status !== "ALL" ? "没有符合条件的手记" : "还没有手记"}
          description={
            q || status !== "ALL"
              ? "试试清除筛选条件，或换一个关键词。"
              : "写下第一篇手记，支持 Markdown、代码块与目录。"
          }
          action={
            q || status !== "ALL" ? (
              <ButtonLink href="/admin/posts" variant="secondary" size="sm">
                清除筛选
              </ButtonLink>
            ) : (
              <ButtonLink href="/admin/posts/new" size="sm">
                <Plus size={15} aria-hidden />
                新建手记
              </ButtonLink>
            )
          }
        />
      ) : (
        <ul className="divide-y divide-[color:var(--border)] rounded-[12px] border border-line bg-surface">
          {posts.map((post) => {
            const meta = POST_STATUS[post.status] ?? POST_STATUS.DRAFT;
            return (
              <li key={post.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-[200px] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/posts/${post.id}`} className="font-medium hover:text-primary">
                      {post.title}
                    </Link>
                    <Badge tone={meta.tone} dot>
                      {meta.label}
                    </Badge>
                    {post.pinned ? <Badge tone="warning">置顶</Badge> : null}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="caption text-muted">/blog/{post.slug}</span>
                    {post.tags.slice(0, 4).map((tag) => (
                      <TagPill key={tag.id}>{tag.name}</TagPill>
                    ))}
                    {post.tags.length > 4 ? (
                      <span className="caption text-muted">+{post.tags.length - 4}</span>
                    ) : null}
                  </div>
                </div>

                <div className="caption w-[150px] shrink-0 text-muted">
                  <p>{post.publishedAt ? `发布 ${formatDateTime(post.publishedAt)}` : "尚未发布"}</p>
                  <p className="mt-0.5">更新 {formatDateTime(post.updatedAt)}</p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="inline-flex h-9 items-center rounded-[8px] px-2 text-xs text-muted hover:bg-primary-soft hover:text-ink"
                  >
                    编辑
                  </Link>
                  <Link
                    href={`/admin/preview/post/${post.id}`}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex h-9 items-center rounded-[8px] px-2 text-xs text-muted hover:bg-primary-soft hover:text-ink"
                  >
                    预览
                  </Link>
                  {post.status === "PUBLISHED" ? (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex h-9 items-center gap-1 rounded-[8px] px-2 text-xs text-muted hover:bg-primary-soft hover:text-ink"
                    >
                      <ExternalLink size={13} aria-hidden />
                      前台
                    </Link>
                  ) : null}
                  <DeleteForm
                    action={deletePostAction}
                    id={post.id}
                    confirmText={`确定删除「${post.title}」吗？此操作不可撤销。`}
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
