"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, ExternalLink } from "lucide-react";
import { autosavePostAction, savePostAction } from "@/actions/posts";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { ImageField } from "@/components/admin/image-field";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";

export type PostFormValues = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverUrl: string;
  pinned: boolean;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  publishedAt: string;
  tags: string[];
  seoTitle: string;
  seoDesc: string;
  published: boolean;
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

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "草稿" },
  { value: "PUBLISHED", label: "发布" },
  { value: "SCHEDULED", label: "定时" },
] as const;

export function PostForm({
  initial,
  knownTags,
  siteUrl,
}: {
  initial: PostFormValues;
  knownTags: string[];
  siteUrl: string;
}) {
  const [state, formAction, pending] = useActionState(savePostAction, null);
  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [tagText, setTagText] = useState(initial.tags.join(", "));
  const [status, setStatus] = useState<string>(initial.status);
  const [dirty, setDirty] = useState(false);
  const [copied, setCopied] = useState(false);
  const [autosave, setAutosave] = useState<{ state: "idle" | "saving" | "saved" | "error"; at?: string }>({
    state: "idle",
  });
  const formRef = useRef<HTMLFormElement>(null);
  const lastSavedRef = useRef(`${initial.title}::${initial.content}`);

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

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod) return;
      if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }
      if (event.key === "Enter") {
        event.preventDefault();
        if (!window.confirm("现在发布这篇手记吗？发布后前台立即可见。")) return;
        setPostStatus("PUBLISHED");
        // 等状态写入隐藏字段后再提交，避免提交到旧的草稿状态
        window.setTimeout(() => formRef.current?.requestSubmit(), 0);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // 自动保存：仅对已存在的草稿生效，20 秒或停止输入 6 秒
  useEffect(() => {
    if (!initial.id || status !== "DRAFT") return;
    const snapshot = `${title}::${content}`;
    if (snapshot === lastSavedRef.current) return;

    const timer = window.setTimeout(async () => {
      setAutosave({ state: "saving" });
      const result = await autosavePostAction({ id: initial.id, title, content }).catch(() => ({
        ok: false as const,
        message: "网络异常",
      }));
      if (result.ok && result.savedAt) {
        lastSavedRef.current = snapshot;
        setAutosave({
          state: "saved",
          at: new Date(result.savedAt).toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      } else if (!result.ok && "message" in result && result.message) {
        setAutosave({ state: "error" });
      }
    }, 6000);

    return () => window.clearTimeout(timer);
  }, [title, content, status, initial.id]);

  useEffect(() => {
    if (!dirty) return;
    const timer = window.setTimeout(() => setDirty(false), 30000);
    return () => window.clearTimeout(timer);
  }, [dirty]);

  function setPostStatus(next: string) {
    setStatus(next);
    setDirty(true);
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      onChange={() => setDirty(true)}
      onSubmit={() => setDirty(false)}
      className="space-y-4"
    >
      <input type="hidden" name="id" value={initial.id} />
      <input type="hidden" name="tags" value={tags.join(",")} />
      <input type="hidden" name="status" value={status} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ButtonLink href="/admin/posts" variant="ghost" size="sm">
          <ArrowLeft size={15} aria-hidden />
          返回列表
        </ButtonLink>
        <div className="flex flex-wrap items-center gap-2">
          {initial.id ? (
            <ButtonLink
              href={`/admin/preview/post/${initial.id}`}
              variant="secondary"
              size="sm"
              target="_blank"
            >
              草稿预览
            </ButtonLink>
          ) : null}
          {initial.published && initial.slug ? (
            <ButtonLink href={`/blog/${initial.slug}`} variant="ghost" size="sm" target="_blank">
              <ExternalLink size={14} aria-hidden />
              查看前台
            </ButtonLink>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!initial.slug}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(`${siteUrl}/blog/${initial.slug}`);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              } catch {
                setCopied(false);
              }
            }}
          >
            <Copy size={14} aria-hidden />
            {copied ? "已复制" : "复制链接"}
          </Button>
        </div>
      </div>

      <div className="rounded-[12px] border border-line bg-surface p-5 lg:p-6">
        <label htmlFor="post-title" className="field-label">
          标题 <span style={{ color: "var(--danger)" }}>*</span>
        </label>
        <input
          id="post-title"
          name="title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (!slugTouched) setSlug(slugify(event.target.value));
            setDirty(true);
          }}
          required
          maxLength={120}
          placeholder="给这篇手记起个标题…"
          className="w-full border-0 bg-transparent p-0 font-serif text-2xl font-semibold outline-none placeholder:text-muted/60 lg:text-3xl"
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="URL 标识" htmlFor="post-slug" hint="小写字母、数字与连字符，发布后修改会让旧链接失效">
            <Input
              id="post-slug"
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
          <Field label="标签" htmlFor="post-tags" hint="英文逗号分隔，最多 12 个">
            <Input
              id="post-tags"
              value={tagText}
              onChange={(event) => setTagText(event.target.value)}
              placeholder="工程实践, Next.js"
            />
          </Field>
        </div>

        {knownTags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {knownTags.map((tag) => {
              const active = tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    const next = active
                      ? tags.filter((item) => item !== tag)
                      : [...tags, tag].slice(0, 12);
                    setTagText(next.join(", "));
                  }}
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
      </div>

      <div className="rounded-[12px] border border-line bg-surface p-5 lg:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif text-lg font-medium">正文</h2>
          <span className="text-xs text-muted" aria-live="polite">
            {autosave.state === "saving"
              ? "正在自动保存…"
              : autosave.state === "saved"
                ? `已自动保存于 ${autosave.at}`
                : autosave.state === "error"
                  ? "自动保存失败，请手动保存或检查网络"
                  : status === "DRAFT"
                    ? "草稿会自动保存"
                    : "仅草稿状态自动保存"}
          </span>
        </div>
        <MarkdownEditor name="content" value={content} onChange={(value) => {
          setContent(value);
          setDirty(true);
        }} rows={20} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Section title="摘要与封面">
          <Field label="摘要" htmlFor="post-summary" hint="留空时自动截取正文前 120 字">
            <Textarea
              id="post-summary"
              name="summary"
              defaultValue={initial.summary}
              maxLength={200}
              rows={3}
            />
          </Field>
          <ImageField
            name="coverUrl"
            label="封面"
            defaultValue={initial.coverUrl}
            aspect="16 / 9"
            hint="选填。列表与分享卡片无封面时使用站点默认图。"
          />
        </Section>

        <Section title="发布设置">
          <div>
            <p className="field-label">状态</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPostStatus(option.value)}
                  aria-pressed={status === option.value}
                  className={cn(
                    "inline-flex h-9 items-center rounded-full border px-3 text-sm transition-colors",
                    status === option.value
                      ? "border-transparent bg-primary text-[color:var(--primary-contrast)]"
                      : "border-line text-muted hover:border-line-strong hover:text-ink",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="field-hint">
              {status === "PUBLISHED"
                ? "保存后立即发布并出现在前台。"
                : status === "SCHEDULED"
                  ? "按下面的时间定时发布，由定时任务执行。"
                  : "草稿不会出现在前台，可随时预览。"}
            </p>
          </div>

          <Field
            label={status === "SCHEDULED" ? "发布时间" : "发布时间（选填）"}
            htmlFor="post-publishedAt"
            hint="按 Asia/Shanghai 时间填写；早于当前时间会被视为立即发布"
          >
            <Input
              id="post-publishedAt"
              name="publishedAt"
              type="datetime-local"
              defaultValue={initial.publishedAt}
              disabled={status === "DRAFT"}
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              name="pinned"
              defaultChecked={initial.pinned}
              className="h-4 w-4"
              style={{ accentColor: "var(--primary)" }}
            />
            置顶（手记列表顶部，最多 2 篇）
          </label>
        </Section>
      </div>

      <Section title="SEO 覆盖" description="留空时回退到站点默认设置。">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="自定义标题" htmlFor="post-seoTitle" hint="最多 60 字">
            <Input id="post-seoTitle" name="seoTitle" defaultValue={initial.seoTitle} maxLength={60} />
          </Field>
          <Field label="自定义描述" htmlFor="post-seoDesc" hint="最多 160 字">
            <Textarea
              id="post-seoDesc"
              name="seoDesc"
              defaultValue={initial.seoDesc}
              maxLength={160}
              rows={2}
            />
          </Field>
        </div>
      </Section>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 rounded-[12px] border border-line bg-surface/95 px-5 py-4 backdrop-blur">
        <Button type="submit" loading={pending} disabled={pending}>
          <Check size={15} aria-hidden />
          {status === "DRAFT" ? "保存草稿" : status === "SCHEDULED" ? "保存定时发布" : "保存并发布"}
        </Button>
        <span aria-live="polite" className="text-sm">
          {state?.ok ? (
            <span style={{ color: "var(--success)" }}>已保存</span>
          ) : state && !state.ok ? (
            <span style={{ color: "var(--danger)" }}>{state.error.message}</span>
          ) : (
            <span className="text-muted">⌘/Ctrl + S 保存 · ⌘/Ctrl + Enter 发布</span>
          )}
        </span>
        <Link href="/admin/posts" className="ml-auto text-xs text-muted hover:text-ink">
          完成后返回列表
        </Link>
      </div>
    </form>
  );
}
