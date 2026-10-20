import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { AdminPageHeader, Panel } from "@/components/admin/panel";
import { AdminForm } from "@/components/admin/admin-form";
import { DeleteForm, SubmitButton } from "@/components/admin/submit-button";
import { Field, Input, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { SkillMeter } from "@/components/ui/skill-meter";
import { SKILL_LEVELS, skillLevelName } from "@/lib/constants";
import {
  deleteSkillAction,
  deleteSkillCategoryAction,
  moveSkillAction,
  saveSkillAction,
  saveSkillCategoryAction,
} from "@/actions/skills";
import { getSkillCategories } from "@/server/queries/skills";

export const dynamic = "force-dynamic";

type Category = Awaited<ReturnType<typeof getSkillCategories>>[number];
type Skill = Category["skills"][number];

function CategoryFields({ category }: { category?: Category }) {
  const key = category?.id ?? "new";
  return (
    <>
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="分类名" htmlFor={`cat-name-${key}`} required hint="最多 30 字">
          <Input
            id={`cat-name-${key}`}
            name="name"
            defaultValue={category?.name ?? ""}
            required
            maxLength={30}
          />
        </Field>
        <Field label="锚点标识" htmlFor={`cat-slug-${key}`} required hint="小写字母、数字与连字符">
          <Input
            id={`cat-slug-${key}`}
            name="slug"
            defaultValue={category?.slug ?? ""}
            required
            pattern="[a-z0-9-]+"
            placeholder="frontend"
          />
        </Field>
        <Field label="图标名" htmlFor={`cat-icon-${key}`} hint="lucide 图标名，可留空">
          <Input
            id={`cat-icon-${key}`}
            name="icon"
            defaultValue={category?.icon ?? ""}
            maxLength={40}
            placeholder="code"
          />
        </Field>
      </div>
    </>
  );
}

function SkillFields({ categoryId, skill }: { categoryId: string; skill?: Skill }) {
  const key = skill?.id ?? `${categoryId}-new`;
  return (
    <>
      <input type="hidden" name="categoryId" value={skill?.categoryId ?? categoryId} />
      {skill ? <input type="hidden" name="id" value={skill.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="技能名" htmlFor={`skill-name-${key}`} required>
          <Input
            id={`skill-name-${key}`}
            name="name"
            defaultValue={skill?.name ?? ""}
            required
            maxLength={30}
          />
        </Field>
        <Field label="熟练度" htmlFor={`skill-level-${key}`} required>
          <Select id={`skill-level-${key}`} name="level" defaultValue={String(skill?.level ?? 3)}>
            {SKILL_LEVELS.map((item) => (
              <option key={item.level} value={item.level}>
                {item.level} · {item.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="年限" htmlFor={`skill-years-${key}`} hint="0-60，可留空">
          <Input
            id={`skill-years-${key}`}
            name="years"
            type="number"
            min={0}
            max={60}
            defaultValue={skill?.years ?? ""}
          />
        </Field>
        <Field label="图标名" htmlFor={`skill-icon-${key}`} hint="可留空">
          <Input
            id={`skill-icon-${key}`}
            name="icon"
            defaultValue={skill?.icon ?? ""}
            maxLength={40}
          />
        </Field>
        <Field label="一句描述" htmlFor={`skill-desc-${key}`} hint="最多 60 字" className="sm:col-span-2">
          <Input
            id={`skill-desc-${key}`}
            name="description"
            defaultValue={skill?.description ?? ""}
            maxLength={60}
          />
        </Field>
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          name="learning"
          defaultChecked={skill?.learning ?? false}
          className="h-4 w-4"
          style={{ accentColor: "var(--primary)" }}
        />
        标记为「学习中」，会出现在技能页底部
      </label>
    </>
  );
}

export default async function AdminSkillsPage() {
  const categories = await getSkillCategories();
  const totalSkills = categories.reduce((sum, category) => sum + category.skills.length, 0);

  return (
    <>
      <AdminPageHeader
        eyebrow="Skill tree"
        title="技能管理"
        description={`共 ${categories.length} 个分类、${totalSkills} 项技能。前台锚点顺序与这里的排序一致。`}
      />

      <div className="space-y-6">
        <Panel
          title="技能分类"
          description="分类用于前台锚点跳转，锚点标识一旦发布建议不要再改。"
          actions={
            <details>
              <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-[8px] border border-line px-3 text-[0.8125rem] hover:border-line-strong">
                <Plus size={14} aria-hidden />
                新增分类
              </summary>
              <div className="mt-3 w-full min-w-[280px] rounded-[8px] border border-line p-4 sm:w-[640px]">
                <AdminForm action={saveSkillCategoryAction} submitLabel="添加分类" compact>
                  <CategoryFields />
                </AdminForm>
              </div>
            </details>
          }
        >
          {categories.length === 0 ? (
            <p className="text-sm text-muted">还没有技能分类。先创建一个分类，例如「前端工程」。</p>
          ) : (
            <ul className="divide-y divide-[color:var(--border)]">
              {categories.map((category) => (
                <li key={category.id} className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="font-medium">{category.name}</span>
                      <span className="caption text-muted">/{category.slug}</span>
                      <Badge tone="muted">{category.skills.length} 项技能</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <details>
                        <summary className="inline-flex h-9 cursor-pointer list-none items-center rounded-[8px] px-2 text-xs text-muted hover:bg-primary-soft hover:text-ink">
                          编辑
                        </summary>
                        <div className="mt-3 w-full min-w-[280px] rounded-[8px] border border-line p-4 sm:w-[640px]">
                          <AdminForm action={saveSkillCategoryAction} submitLabel="保存分类" compact>
                            <CategoryFields category={category} />
                          </AdminForm>
                        </div>
                      </details>
                      <DeleteForm
                        action={deleteSkillCategoryAction}
                        id={category.id}
                        extra={category.skills.length > 0 ? { force: "1" } : undefined}
                        confirmText={
                          category.skills.length > 0
                            ? `该分类下有 ${category.skills.length} 项技能，删除分类会一并删除这些技能。确定继续吗？`
                            : "确定删除这个分类吗？"
                        }
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {categories.map((category) => (
          <Panel
            key={category.id}
            title={category.name}
            description={`${category.skills.length} 项技能 · 前台锚点 /skills#${category.slug}`}
            actions={
              <details>
                <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-[8px] border border-line px-3 text-[0.8125rem] hover:border-line-strong">
                  <Plus size={14} aria-hidden />
                  新增技能
                </summary>
                <div className="mt-3 w-full min-w-[280px] rounded-[8px] border border-line p-4 sm:w-[560px]">
                  <AdminForm action={saveSkillAction} submitLabel="添加技能" compact>
                    <SkillFields categoryId={category.id} />
                  </AdminForm>
                </div>
              </details>
            }
          >
            {category.skills.length === 0 ? (
              <p className="text-sm text-muted">这个分类下还没有技能。</p>
            ) : (
              <ul className="divide-y divide-[color:var(--border)]">
                {category.skills.map((skill, index) => (
                  <li key={skill.id} className="py-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{skill.name}</span>
                          <SkillMeter level={skill.level} />
                          <span className="caption text-muted">
                            {skillLevelName(skill.level)}
                            {skill.years ? ` · ${skill.years} 年` : ""}
                          </span>
                          {skill.learning ? <Badge tone="primary">学习中</Badge> : null}
                        </div>
                        {skill.description ? (
                          <p className="mt-1 text-sm text-muted">{skill.description}</p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <form action={moveSkillAction}>
                          <input type="hidden" name="id" value={skill.id} />
                          <input type="hidden" name="direction" value="up" />
                          <SubmitButton variant="ghost" disabled={index === 0} aria-label="上移">
                            <ChevronUp size={15} aria-hidden />
                          </SubmitButton>
                        </form>
                        <form action={moveSkillAction}>
                          <input type="hidden" name="id" value={skill.id} />
                          <input type="hidden" name="direction" value="down" />
                          <SubmitButton
                            variant="ghost"
                            disabled={index === category.skills.length - 1}
                            aria-label="下移"
                          >
                            <ChevronDown size={15} aria-hidden />
                          </SubmitButton>
                        </form>
                        <details>
                          <summary className="inline-flex h-9 cursor-pointer list-none items-center rounded-[8px] px-2 text-xs text-muted hover:bg-primary-soft hover:text-ink">
                            编辑
                          </summary>
                          <div className="mt-3 w-full min-w-[280px] rounded-[8px] border border-line p-4 sm:w-[560px]">
                            <AdminForm action={saveSkillAction} submitLabel="保存技能" compact>
                              <SkillFields categoryId={category.id} skill={skill} />
                            </AdminForm>
                          </div>
                        </details>
                        <DeleteForm
                          action={deleteSkillAction}
                          id={skill.id}
                          confirmText={`确定删除「${skill.name}」吗？`}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        ))}
      </div>
    </>
  );
}
