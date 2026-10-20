import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  FolderKanban,
  ImageIcon,
  Inbox,
  PencilLine,
  Plus,
  TriangleAlert,
} from "lucide-react";
import { AdminPageHeader, Panel } from "@/components/admin/panel";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { getDashboardStats, getRecentEdits } from "@/server/queries/site";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

type Stats = Awaited<ReturnType<typeof getDashboardStats>>;
type Edits = Awaited<ReturnType<typeof getRecentEdits>>;

function StatCard({
  label,
  value,
  hint,
  icon,
  href,
}: {
  label: string;
  value: number;
  hint?: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[12px] border border-line bg-surface p-5 transition-colors hover:border-line-strong"
    >
      <div className="flex items-center justify-between">
        <span className="caption text-muted">{label}</span>
        <span className="text-muted transition-colors group-hover:text-primary" aria-hidden>
          {icon}
        </span>
      </div>
      <p className="mt-3 font-serif text-3xl font-semibold" style={{ fontFeatureSettings: '"tnum"' }}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </Link>
  );
}

export default async function AdminDashboardPage() {
  let stats: Stats | null = null;
  let edits: Edits = [];
  let dbError = false;

  try {
    [stats, edits] = await Promise.all([getDashboardStats(), getRecentEdits()]);
  } catch {
    dbError = true;
  }

  const empty = stats ? stats.publishedProjects + stats.publishedPosts === 0 : false;
  const warnings: string[] = [];
  if (dbError) warnings.push("数据库连接失败，统计与最近编辑暂不可用。请检查 DATABASE_URL 与迁移状态。");
  if (process.env.STORAGE_DRIVER && process.env.STORAGE_DRIVER !== "local") {
    warnings.push("当前存储驱动尚未实现，上传会失败。请保持 STORAGE_DRIVER=local 或接入对应存储。");
  }
  if (!process.env.CRON_SECRET) warnings.push("未配置 CRON_SECRET，定时发布接口不可用。");

  const checklist = stats
    ? [
        { label: "填写站点设置", done: true, href: "/admin/settings" },
        {
          label: "完善个人信息与履历",
          done: Boolean(stats.publishedProjects + stats.publishedPosts > 0),
          href: "/admin/profile",
        },
        { label: "发布第一份委托", done: stats.publishedProjects > 0, href: "/admin/projects/new" },
        { label: "发布第一篇手记", done: stats.publishedPosts > 0, href: "/admin/posts/new" },
      ]
    : [];

  return (
    <>
      <AdminPageHeader
        eyebrow="Adventurer's Ledger"
        title="仪表盘"
        description="档案的全部内容都在这里维护。保存后会立即刷新前台缓存，无需重新部署。"
        actions={
          <>
            <ButtonLink href="/admin/posts/new" size="sm">
              <Plus size={15} aria-hidden />
              新建手记
            </ButtonLink>
            <ButtonLink href="/admin/projects/new" size="sm" variant="secondary">
              <Plus size={15} aria-hidden />
              新建委托
            </ButtonLink>
          </>
        }
      />

      {warnings.length > 0 ? (
        <div className="mb-6 space-y-2" role="status">
          {warnings.map((warning) => (
            <p
              key={warning}
              className="flex items-start gap-2 rounded-[8px] border px-4 py-3 text-sm"
              style={{
                color: "var(--warning)",
                borderColor: "color-mix(in srgb, var(--warning) 32%, transparent)",
                backgroundColor: "color-mix(in srgb, var(--warning) 9%, transparent)",
              }}
            >
              <TriangleAlert size={16} aria-hidden className="mt-0.5 shrink-0" />
              {warning}
            </p>
          ))}
        </div>
      ) : null}

      {stats ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="已发布委托"
            value={stats.publishedProjects}
            icon={<FolderKanban size={17} />}
            href="/admin/projects"
          />
          <StatCard
            label="进行中委托"
            value={stats.inProgressProjects}
            icon={<PencilLine size={17} />}
            href="/admin/projects?status=IN_PROGRESS"
          />
          <StatCard
            label="已发布手记"
            value={stats.publishedPosts}
            icon={<BookOpen size={17} />}
            href="/admin/posts?status=PUBLISHED"
          />
          <StatCard
            label="草稿"
            value={stats.draftPosts}
            icon={<BookOpen size={17} />}
            href="/admin/posts?status=DRAFT"
          />
          <StatCard
            label="媒体文件"
            value={stats.mediaCount}
            icon={<ImageIcon size={17} />}
            href="/admin/media"
          />
          <StatCard
            label="未读传讯"
            value={stats.unreadMessages}
            icon={<Inbox size={17} />}
            href="/admin/messages"
          />
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title="最近编辑" description="按更新时间排序，点击直达编辑器。">
          {edits.length === 0 ? (
            <p className="text-sm text-muted">还没有编辑记录。新建一份委托或一篇手记开始吧。</p>
          ) : (
            <ul className="divide-y divide-[color:var(--border)]">
              {edits.map((item) => (
                <li key={`${item.type}-${item.id}`}>
                  <Link
                    href={`/admin/${item.type === "post" ? "posts" : "projects"}/${item.id}`}
                    className="flex items-center justify-between gap-4 py-3 text-sm transition-colors hover:text-primary"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <Badge tone={item.type === "post" ? "primary" : "muted"}>
                        {item.type === "post" ? "手记" : "委托"}
                      </Badge>
                      <span className="truncate">{item.title}</span>
                    </span>
                    <span className="caption shrink-0 text-muted">{formatDateTime(item.updatedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="快捷入口">
            <div className="grid gap-2">
              {[
                { href: "/admin/posts/new", label: "新建手记", icon: BookOpen },
                { href: "/admin/projects/new", label: "新建委托", icon: FolderKanban },
                { href: "/admin/profile", label: "编辑个人信息", icon: PencilLine },
                { href: "/admin/media", label: "上传媒体", icon: ImageIcon },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex h-11 items-center gap-2.5 rounded-[8px] border border-line px-3 text-sm transition-colors hover:border-line-strong hover:bg-primary-soft"
                >
                  <item.icon size={16} aria-hidden className="text-muted" />
                  {item.label}
                  <ArrowRight size={14} aria-hidden className="ml-auto text-muted" />
                </Link>
              ))}
            </div>
          </Panel>

          {empty ? (
            <Panel title="上线清单" description="按顺序完成，前台的骨架就完整了。">
              <ul className="space-y-2.5">
                {checklist.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="flex items-center gap-2 text-sm hover:text-primary">
                      {item.done ? (
                        <CheckCircle2 size={16} aria-hidden style={{ color: "var(--success)" }} />
                      ) : (
                        <Circle size={16} aria-hidden className="text-muted" />
                      )}
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}
        </div>
      </div>
    </>
  );
}
