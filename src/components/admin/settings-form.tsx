"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveSiteSettings } from "@/actions/settings";
import type { SocialLink } from "@/lib/constants";
import { SOCIAL_PLATFORMS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { ImageField } from "@/components/admin/image-field";
import type { SiteSettingsView } from "@/server/queries/site";

const PLATFORM_LABELS: Record<string, string> = {
  github: "GitHub",
  email: "邮箱",
  twitter: "Twitter / X",
  linkedin: "LinkedIn",
  juejin: "掘金",
  zhihu: "知乎",
  bilibili: "哔哩哔哩",
  rss: "RSS",
  website: "个人网站",
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[12px] border border-line bg-surface p-5 lg:p-6">
      <h2 className="font-serif text-lg font-medium">{title}</h2>
      {description ? <p className="mt-1 text-xs text-muted">{description}</p> : null}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

export function SettingsForm({ initial }: { initial: SiteSettingsView }) {
  const [state, formAction, pending] = useActionState(saveSiteSettings, null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(initial.socialLinks);
  const [color, setColor] = useState(initial.primaryColor);

  function updateLink(index: number, patch: Partial<SocialLink>) {
    setSocialLinks((links) => links.map((link, i) => (i === index ? { ...link, ...patch } : link)));
  }

  return (
    <form action={formAction} className="space-y-4">
      <Section title="站点标识" description="影响全局导航、页脚与浏览器标题后缀。">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="站点名" htmlFor="siteName" required hint="最多 30 字">
            <Input id="siteName" name="siteName" defaultValue={initial.siteName} required maxLength={30} />
          </Field>
          <Field label="副标题 / 签名" htmlFor="tagline" hint="最多 60 字，用于页脚与默认描述">
            <Input id="tagline" name="tagline" defaultValue={initial.tagline} maxLength={60} />
          </Field>
        </div>
        <ImageField
          name="emblemUrl"
          label="徽记"
          defaultValue={initial.emblemUrl ?? ""}
          aspect="1 / 1"
          hint="建议 512×512 的 PNG；未设置时使用内置几何徽记。"
        />
        <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-end">
          <Field label="主色" htmlFor="primaryColor" required hint="HEX 格式">
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="选择主色"
                value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : "#1F7F91"}
                onChange={(event) => setColor(event.target.value.toUpperCase())}
                className="h-10 w-11 shrink-0 cursor-pointer rounded-[8px] border border-line bg-surface p-1"
              />
              <Input
                id="primaryColor"
                name="primaryColor"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                required
                pattern="#[0-9a-fA-F]{6}"
              />
            </div>
          </Field>
          <p className="pb-2 text-xs text-muted">
            主色会同时派生浅色与深色两套主题。保存后请确认按钮文字与背景对比度仍满足 AA。
          </p>
        </div>
      </Section>

      <Section title="默认 SEO" description="没有自定义标题或描述的页面会回退到这里的设置。">
        <Field label="默认 SEO 标题" htmlFor="defaultSeoTitle" hint="最多 60 字">
          <Input
            id="defaultSeoTitle"
            name="defaultSeoTitle"
            defaultValue={initial.defaultSeoTitle}
            maxLength={60}
          />
        </Field>
        <Field label="默认 SEO 描述" htmlFor="defaultSeoDesc" hint="最多 160 字">
          <Textarea
            id="defaultSeoDesc"
            name="defaultSeoDesc"
            defaultValue={initial.defaultSeoDesc}
            maxLength={160}
            rows={3}
          />
        </Field>
        <ImageField
          name="defaultOgImageUrl"
          label="默认分享图"
          defaultValue={initial.defaultOgImageUrl ?? ""}
          hint="建议 1200×630，用于没有封面的页面。"
        />
      </Section>

      <Section title="社交链接" description="首屏、关于页与页脚共用这份数据，最多 12 个。">
        <input type="hidden" name="socialLinks" value={JSON.stringify(socialLinks)} />
        {socialLinks.length === 0 ? (
          <p className="text-sm text-muted">还没有社交链接。</p>
        ) : (
          <ul className="space-y-3">
            {socialLinks.map((link, index) => (
              <li key={index} className="grid gap-2 sm:grid-cols-[130px_140px_minmax(0,1fr)_44px]">
                <Select
                  aria-label={`第 ${index + 1} 个链接的平台`}
                  value={link.platform}
                  onChange={(event) => updateLink(index, { platform: event.target.value })}
                >
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <option key={platform} value={platform}>
                      {PLATFORM_LABELS[platform] ?? platform}
                    </option>
                  ))}
                </Select>
                <Input
                  aria-label={`第 ${index + 1} 个链接的名称`}
                  value={link.label}
                  onChange={(event) => updateLink(index, { label: event.target.value })}
                  placeholder="显示名"
                  maxLength={20}
                />
                <Input
                  aria-label={`第 ${index + 1} 个链接的地址`}
                  value={link.url}
                  onChange={(event) => updateLink(index, { url: event.target.value })}
                  placeholder="https:// 或 mailto:"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="删除该链接"
                  onClick={() => setSocialLinks((links) => links.filter((_, i) => i !== index))}
                >
                  <Trash2 size={15} aria-hidden style={{ color: "var(--danger)" }} />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            setSocialLinks((links) => [
              ...links,
              { platform: "github", label: "GitHub", url: "https://github.com/" },
            ])
          }
          disabled={socialLinks.length >= 12}
        >
          <Plus size={14} aria-hidden />
          添加链接
        </Button>
      </Section>

      <Section title="页脚与文件">
        <Field label="页脚文案" htmlFor="footerText" hint="最多 120 字">
          <Input id="footerText" name="footerText" defaultValue={initial.footerText} maxLength={120} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ICP 备案号" htmlFor="icpNumber" hint="选填，部署在境内时填写">
            <Input id="icpNumber" name="icpNumber" defaultValue={initial.icpNumber} maxLength={40} />
          </Field>
          <Field label="简历文件地址" htmlFor="resumeUrl" hint="填写 PDF 的可访问地址，留空则不显示下载按钮">
            <Input
              id="resumeUrl"
              name="resumeUrl"
              defaultValue={initial.resumeUrl ?? ""}
              placeholder="https://.../resume.pdf"
            />
          </Field>
        </div>
        <Field label="RSS 输出模式" htmlFor="rssMode">
          <Select id="rssMode" name="rssMode" defaultValue={initial.rssMode}>
            <option value="SUMMARY">摘要</option>
            <option value="FULL">全文</option>
          </Select>
        </Field>
      </Section>

      <div className="flex flex-wrap items-center gap-3 rounded-[12px] border border-line bg-surface px-5 py-4">
        <Button type="submit" loading={pending}>
          保存设置
        </Button>
        <span aria-live="polite" className="text-sm">
          {state?.ok ? (
            <span style={{ color: "var(--success)" }}>已保存，前台缓存已刷新。</span>
          ) : state && !state.ok ? (
            <span style={{ color: "var(--danger)" }}>{state.error.message}</span>
          ) : (
            <span className="text-muted">保存后立即生效，无需重新部署。</span>
          )}
        </span>
      </div>
    </form>
  );
}
