import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { AdminPageHeader, Panel } from "@/components/admin/panel";
import { AdminForm } from "@/components/admin/admin-form";
import { ProfileForm } from "@/components/admin/profile-form";
import { DeleteForm, SubmitButton } from "@/components/admin/submit-button";
import { Field, Input } from "@/components/ui/field";
import {
  deleteTimelineAction,
  moveTimelineAction,
  saveTimelineAction,
} from "@/actions/profile";
import { getProfile, getTimeline } from "@/server/queries/site";

export const dynamic = "force-dynamic";

function TimelineFields({
  entry,
}: {
  entry?: { id: string; period: string; title: string; organization: string | null; description: string | null };
}) {
  return (
    <>
      {entry ? <input type="hidden" name="id" value={entry.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="时间" htmlFor={`period-${entry?.id ?? "new"}`} required hint="如「2022 - 至今」">
          <Input
            id={`period-${entry?.id ?? "new"}`}
            name="period"
            defaultValue={entry?.period ?? ""}
            required
            maxLength={30}
          />
        </Field>
        <Field label="标题" htmlFor={`title-${entry?.id ?? "new"}`} required>
          <Input
            id={`title-${entry?.id ?? "new"}`}
            name="title"
            defaultValue={entry?.title ?? ""}
            required
            maxLength={60}
          />
        </Field>
        <Field label="组织" htmlFor={`organization-${entry?.id ?? "new"}`}>
          <Input
            id={`organization-${entry?.id ?? "new"}`}
            name="organization"
            defaultValue={entry?.organization ?? ""}
            maxLength={60}
          />
        </Field>
        <Field label="描述" htmlFor={`description-${entry?.id ?? "new"}`} hint="最多 120 字">
          <Input
            id={`description-${entry?.id ?? "new"}`}
            name="description"
            defaultValue={entry?.description ?? ""}
            maxLength={120}
          />
        </Field>
      </div>
    </>
  );
}

export default async function AdminProfilePage() {
  const [profile, timeline] = await Promise.all([getProfile(), getTimeline()]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Registration card"
        title="个人信息"
        description="登记卡、自述与履历。前台「关于」页与首屏都读取这里的数据。"
      />

      <div className="space-y-6">
        <Panel
          title="冒险者登记卡"
          description="字段留空时，前台整行隐藏，不会显示「未填写」。"
        >
          <ProfileForm initial={profile} />
        </Panel>

        <Panel
          title="履历年表"
          description="按顺序从上到下展示，使用上下箭头调整顺序。"
          actions={
            <details className="group">
              <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-[8px] border border-line px-3 text-[0.8125rem] hover:border-line-strong">
                <Plus size={14} aria-hidden />
                新增条目
              </summary>
              <div className="mt-3 w-full max-w-[640px] rounded-[8px] border border-line p-4">
                <AdminForm action={saveTimelineAction} submitLabel="添加" compact>
                  <TimelineFields />
                </AdminForm>
              </div>
            </details>
          }
        >
          {timeline.length === 0 ? (
            <p className="text-sm text-muted">还没有履历条目。添加第一条，前台的时间线才会出现。</p>
          ) : (
            <ul className="space-y-3">
              {timeline.map((entry, index) => (
                <li key={entry.id} className="rounded-[8px] border border-line p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="caption text-muted">{entry.period}</p>
                      <p className="mt-0.5 font-medium">{entry.title}</p>
                      {entry.organization ? (
                        <p className="text-xs text-muted">{entry.organization}</p>
                      ) : null}
                      {entry.description ? (
                        <p className="mt-1 text-sm text-muted">{entry.description}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <form action={moveTimelineAction}>
                        <input type="hidden" name="id" value={entry.id} />
                        <input type="hidden" name="direction" value="up" />
                        <SubmitButton variant="ghost" disabled={index === 0} aria-label="上移">
                          <ChevronUp size={15} aria-hidden />
                        </SubmitButton>
                      </form>
                      <form action={moveTimelineAction}>
                        <input type="hidden" name="id" value={entry.id} />
                        <input type="hidden" name="direction" value="down" />
                        <SubmitButton
                          variant="ghost"
                          disabled={index === timeline.length - 1}
                          aria-label="下移"
                        >
                          <ChevronDown size={15} aria-hidden />
                        </SubmitButton>
                      </form>
                      <DeleteForm
                        action={deleteTimelineAction}
                        id={entry.id}
                        confirmText="确定删除这条履历吗？此操作不可撤销。"
                      />
                    </div>
                  </div>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs text-muted hover:text-ink">编辑条目</summary>
                    <div className="mt-3">
                      <AdminForm action={saveTimelineAction} submitLabel="保存" compact>
                        <TimelineFields entry={entry} />
                      </AdminForm>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="前台入口">
          <p className="text-sm text-muted">
            修改后可在前台查看效果：
            <a href="/about" target="_blank" rel="noopener" className="ml-1 underline underline-offset-4">
              关于页 ↗
            </a>
          </p>
        </Panel>
      </div>
    </>
  );
}
