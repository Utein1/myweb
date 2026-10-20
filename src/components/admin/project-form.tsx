"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUp, ArrowDown, Copy, ExternalLink, ImagePlus, Trash2 } from "lucide-react";
import { saveProjectAction } from "@/actions/projects";
import { PROJECT_STATUS_OPTIONS } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { ImageField } from "@/components/admin/image-field";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { cn } from "@/lib/utils";

export type ProjectFormValues = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverUrl: string;
  role: string;
  status: string;
  featured: boolean;
  sortOrder: number;
  startDate: string;
  endDate: string;
  demoUrl: string;
  repoUrl: string;
  tags: string[];
  seoTitle: string;
  seoDesc: string;
  images: { url: string; alt: string }[];
  published: boolean;
};

type GalleryItem = { url: string; alt: string };

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

export function ProjectForm({
  initial,
  knownTags,
  siteUrl,
}: {
  initial: ProjectFormValues;
  knownTags: string[];
  siteUrl: string;
}) {
  const [state, formAction, pending] = useActionState(saveProjectAction, null);
  const [content, setContent] = useState(initial.content);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [tagText, setTagText] = useState(initial.tags.join(", "));
  const [images, setImages] = useState<GalleryItem[]>(initial.images);
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const tags = tagText
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);

  useEffect(() => {
    function handler(event: BeforeUnloadEvent) {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  async function uploadGallery(files: FileList) {
    setUploading(true);
    setUploadError("");
    try {
      for (const file of Array.from(files).slice(0, 8 - images.length)) {
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/upload", { method: "POST", body });
        const payload = (await response.json()) as
          | { ok: true; data: { url: string } }
          | { ok: false; error: { message: string } };
        if (!payload.ok) {
          setUploadError(payload.error.message || "上传失败");
          break;
        }
        setImages((items) => [...items, { url: payload.data.url, alt: "" }].slice(0, 8));
      }
    } catch {
      setUploadError("网络异常，上传失败");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((items) => {
      const target = index + direction;
      if (target < 0 || target >= items.length) return items;
      const next = [...items];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function toggleTag(name: string) {
    const exists = tags.includes(name);
    const next = exists ? tags.filter((tag) => tag !== name) : [...tags, name].slice(0, 12);
    setTagText(next.join(", "));
    setDirty(true);
  }

  return (
    <form
      action={formAction}
      onChange={() => setDirty(true)}
      className="space-y-4"
      onSubmit={() => setDirty(false)}
    >
      <input type="hidden" name="id" value={initial.id} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="tags" value={tags.join(",")} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ButtonLink href="/admin/projects" variant="ghost" size="sm">
            <ArrowLeft size={15} aria-hidden />
            返回列表
          </ButtonLink>
          {initial.slug ? (
            <span className="caption text-muted">/projects/{initial.slug}</span>
          ) : (
            <span className="caption text-muted">新建委托</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {initial.id ? (
            <ButtonLink
              href={`/admin/preview/project/${initial.id}`}
              variant="secondary"
              size="sm"
              target="_blank"
            >
              草稿预览
            </ButtonLink>
          ) : null}
          {initial.published && initial.slug ? (
            <ButtonLink href={`/projects/${initial.slug}`} variant="ghost" size="sm" target="_blank">
              <ExternalLink size={14} aria-hidden />
              查看前台
            </ButtonLink>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={async () => {
              if (!initial.slug) return;
              try {
                await navigator.clipboard.writeText(`${siteUrl}/projects/${initial.slug}`);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              } catch {
                setCopied(false);
              }
            }}
            disabled={!initial.slug}
          >
            <Copy size={14} aria-hidden />
            {copied ? "已复制" : "复制链接"}
          </Button>
        </div>
      </div>

      <Section title="基本信息">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="标题" htmlFor="title" required hint="最多 80 字">
            <Input
              id="title"
              name="title"
              defaultValue={initial.title}
              required
              maxLength={80}
              onChange={(event) => {
                if (!slugTouched) setSlug(slugify(event.target.value));
              }}
            />
          </Field>
          <Field label="URL 标识" htmlFor="slug" required hint="小写字母、数字与连字符，发布后修改会让旧链接失效">
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              pattern="[a-z0-9-]+"
              placeholder="留空自动生成"
            />
          </Field>
        </div>
        <Field label="一行摘要" htmlFor="summary" required hint="最多 100 字，出现在卡片与分享卡片">
          <Input id="summary" name="summary" defaultValue={initial.summary} required maxLength={100} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="承担角色" htmlFor="role" hint="如「独立开发」">
            <Input id="role" name="role" defaultValue={initial.role} maxLength={40} />
          </Field>
          <Field label="排序权重" htmlFor="sortOrder" hint="数字越小越靠前">
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              min={0}
              max={9999}
              defaultValue={initial.sortOrder}
            />
          </Field>
        </div>
      </Section>

      <Section title="时间与状态">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="开始时间" htmlFor="startDate">
            <Input id="startDate" name="startDate" type="date" defaultValue={initial.startDate} />
          </Field>
          <Field label="结束时间" htmlFor="endDate" hint="留空表示进行中">
            <Input id="endDate" name="endDate" type="date" defaultValue={initial.endDate} />
          </Field>
          <Field label="委托状态" htmlFor="status">
            <Select id="status" name="status" defaultValue={initial.status}>
              {PROJECT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={initial.featured}
            className="h-4 w-4"
            style={{ accentColor: "var(--primary)" }}
          />
          在首页精选展示（最多 3 个）
        </label>
      </Section>

      <Section title="封面与图集" description="封面用于列表卡片与分享图；图集出现在详情页。">
        <ImageField
          name="coverUrl"
          label="封面"
          defaultValue={initial.coverUrl}
          aspect="16 / 9"
          hint="发布时必须上传封面。建议 16:9，至少 1200×675。"
        />

        <div>
          <p className="field-label">图集（最多 8 张）</p>
          {images.length === 0 ? (
            <p className="text-sm text-muted">还没有截图。上传后可在详情页以网格展示。</p>
          ) : (
            <ul className="space-y-2">
              {images.map((image, index) => (
                <li
                  key={`${image.url}-${index}`}
                  className="flex flex-wrap items-center gap-2 rounded-[8px] border border-line p-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt=""
                    className="h-14 w-24 shrink-0 rounded-[4px] border border-line object-cover"
                  />
                  <Input
                    aria-label={`第 ${index + 1} 张截图的替代文本`}
                    value={image.alt}
                    onChange={(event) =>
                      setImages((items) =>
                        items.map((item, i) => (i === index ? { ...item, alt: event.target.value } : item)),
                      )
                    }
                    placeholder="替代文本（alt）"
                    maxLength={100}
                    className="min-w-[160px] flex-1"
                  />
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label="上移"
                      disabled={index === 0}
                      onClick={() => moveImage(index, -1)}
                    >
                      <ArrowUp size={14} aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label="下移"
                      disabled={index === images.length - 1}
                      onClick={() => moveImage(index, 1)}
                    >
                      <ArrowDown size={14} aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label="移除"
                      onClick={() => setImages((items) => items.filter((_, i) => i !== index))}
                    >
                      <Trash2 size={14} aria-hidden style={{ color: "var(--danger)" }} />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
              className="sr-only"
              onChange={(event) => {
                if (event.target.files?.length) void uploadGallery(event.target.files);
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={uploading}
              disabled={images.length >= 8}
              onClick={() => fileRef.current?.click()}
            >
              <ImagePlus size={14} aria-hidden />
              上传截图
            </Button>
            <span className="text-xs text-muted">{images.length} / 8</span>
            {uploadError ? (
              <span className="text-xs" role="alert" style={{ color: "var(--danger)" }}>
                {uploadError}
              </span>
            ) : null}
          </div>
        </div>
      </Section>

      <Section title="技术栈与标签" description="用于前台标签展示、筛选与相关推荐，最多 12 个。">
        <Field label="标签" htmlFor="tagText" hint="用英文逗号分隔，回车输入请直接写逗号">
          <Input
            id="tagText"
            value={tagText}
            onChange={(event) => setTagText(event.target.value)}
            placeholder="React, TypeScript, 可视化"
          />
        </Field>
        {knownTags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {knownTags.map((tag) => {
              const active = tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  aria-pressed={active}
                  className={cn(
                    "caption inline-flex h-6 items-center rounded-full border px-2.5 transition-colors",
                    active
                      ? "border-transparent bg-primary-soft text-primary"
                      : "border-line text-muted hover:border-line-strong hover:text-ink",
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        ) : null}
      </Section>

      <Section title="正文">
        <MarkdownEditor name="content" value={content} onChange={setContent} rows={16} />
      </Section>

      <Section title="外链">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="在线演示" htmlFor="demoUrl" hint="留空则不显示按钮">
            <Input id="demoUrl" name="demoUrl" type="url" defaultValue={initial.demoUrl} />
          </Field>
          <Field label="源码仓库" htmlFor="repoUrl" hint="留空则不显示按钮">
            <Input id="repoUrl" name="repoUrl" type="url" defaultValue={initial.repoUrl} />
          </Field>
        </div>
      </Section>

      <Section title="SEO 覆盖" description="留空时回退到站点默认设置。">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="自定义标题" htmlFor="seoTitle" hint="最多 60 字">
            <Input id="seoTitle" name="seoTitle" defaultValue={initial.seoTitle} maxLength={60} />
          </Field>
          <Field label="自定义描述" htmlFor="seoDesc" hint="最多 160 字">
            <Textarea id="seoDesc" name="seoDesc" defaultValue={initial.seoDesc} maxLength={160} rows={2} />
          </Field>
        </div>
      </Section>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 rounded-[12px] border border-line bg-surface/95 px-5 py-4 backdrop-blur">
        <Button type="submit" name="statusPublish" value="DRAFT" variant="secondary" disabled={pending}>
          保存草稿
        </Button>
        <Button type="submit" name="statusPublish" value="PUBLISHED" loading={pending}>
          {initial.published ? "保存并更新" : "保存并发布"}
        </Button>
        <span aria-live="polite" className="text-sm">
          {state?.ok ? (
            <span style={{ color: "var(--success)" }}>已保存</span>
          ) : state && !state.ok ? (
            <span style={{ color: "var(--danger)" }}>{state.error.message}</span>
          ) : (
            <span className="text-muted">
              {initial.published ? "当前已发布" : "当前为草稿，发布后前台才能访问"}
            </span>
          )}
        </span>
        {initial.id ? (
          <Link href="/admin/projects" className="ml-auto text-xs text-muted hover:text-ink">
            完成后返回列表
          </Link>
        ) : null}
      </div>
    </form>
  );
}
