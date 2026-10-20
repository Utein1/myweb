"use client";

import { useActionState, useState } from "react";
import { saveProfileAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { ImageField } from "@/components/admin/image-field";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import type { ProfileView } from "@/server/queries/site";

export function ProfileForm({ initial }: { initial: ProfileView | null }) {
  const [state, formAction, pending] = useActionState(saveProfileAction, null);
  const [bio, setBio] = useState(initial?.bio ?? "");

  return (
    <form action={formAction} className="space-y-5">
      <ImageField
        name="avatarUrl"
        label="头像"
        defaultValue={initial?.avatarUrl ?? ""}
        aspect="1 / 1"
        shape="round"
        hint="建议 1:1 正方形，展示时会自动裁切为圆形。"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="姓名" htmlFor="displayName" required hint="最多 20 字">
          <Input
            id="displayName"
            name="displayName"
            defaultValue={initial?.displayName ?? ""}
            required
            maxLength={20}
          />
        </Field>
        <Field label="称号行" htmlFor="title" hint="如「第七位阶 · 前端冒险者」">
          <Input id="title" name="title" defaultValue={initial?.title ?? ""} maxLength={40} />
        </Field>
        <Field label="职业" htmlFor="className" hint="如「前端工程师」">
          <Input id="className" name="className" defaultValue={initial?.className ?? ""} maxLength={20} />
        </Field>
        <Field label="所属" htmlFor="affiliation" hint="公司或「独立开发者」">
          <Input
            id="affiliation"
            name="affiliation"
            defaultValue={initial?.affiliation ?? ""}
            maxLength={40}
          />
        </Field>
        <Field label="所在地" htmlFor="location">
          <Input id="location" name="location" defaultValue={initial?.location ?? ""} maxLength={30} />
        </Field>
        <Field label="从业年限" htmlFor="yearsExperience" hint="0-60 的整数，用于数据条">
          <Input
            id="yearsExperience"
            name="yearsExperience"
            type="number"
            min={0}
            max={60}
            defaultValue={initial?.yearsExperience ?? ""}
          />
        </Field>
        <Field label="联系邮箱" htmlFor="profile-email">
          <Input
            id="profile-email"
            name="email"
            type="email"
            defaultValue={initial?.email ?? ""}
          />
        </Field>
        <Field label="一句话简介" htmlFor="headline" hint="最多 60 字，出现在首屏">
          <Input id="headline" name="headline" defaultValue={initial?.headline ?? ""} maxLength={60} />
        </Field>
      </div>

      <div>
        <p className="field-label">自述（Markdown）</p>
        <MarkdownEditor
          name="bio"
          value={bio}
          onChange={setBio}
          rows={16}
          placeholder="写下你是谁、关注什么、如何合作…"
        />
        <p className="field-hint">支持标题、列表、引用、代码块与链接；超过 20000 字会被拒绝保存。</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <Button type="submit" loading={pending}>
          保存个人信息
        </Button>
        <span aria-live="polite" className="text-sm">
          {state?.ok ? (
            <span style={{ color: "var(--success)" }}>已保存</span>
          ) : state && !state.ok ? (
            <span style={{ color: "var(--danger)" }}>{state.error.message}</span>
          ) : (
            <span className="text-muted">保存后前台立即更新。</span>
          )}
        </span>
      </div>
    </form>
  );
}
