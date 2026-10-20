"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bold, Code2, Eye, ImagePlus, Italic, Link2, List, PencilLine, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

type PreviewResponse =
  | { ok: true; data: { html: string; minutes: number } }
  | { ok: false; error: { message: string } };

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-primary-soft hover:text-ink"
    >
      {children}
    </button>
  );
}

/** Markdown 分栏编辑器：左源码右预览，移动端切换为标签页 */
export function MarkdownEditor({
  value,
  onChange,
  name = "content",
  rows = 18,
  placeholder = "使用 Markdown 书写正文…",
}: {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  rows?: number;
  placeholder?: string;
}) {
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [html, setHtml] = useState("");
  const [minutes, setMinutes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/preview-markdown", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: value }),
        });
        const payload = (await response.json()) as PreviewResponse;
        if (cancelled) return;
        if (payload.ok) {
          setHtml(payload.data.html);
          setMinutes(payload.data.minutes);
        } else {
          setError(payload.error.message || "预览生成失败");
        }
      } catch {
        if (!cancelled) setError("预览生成失败，请检查网络后重试");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value]);

  const surround = useCallback(
    (before: string, after = before) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = value.slice(start, end);
      const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
      onChange(next);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, end + before.length);
      });
    },
    [onChange, value],
  );

  const prefixLines = useCallback(
    (prefix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const segment = value.slice(lineStart, end);
      const replaced = segment
        .split("\n")
        .map((line) => (line.startsWith(prefix) ? line.slice(prefix.length) : `${prefix}${line}`))
        .join("\n");
      onChange(`${value.slice(0, lineStart)}${replaced}${value.slice(end)}`);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(lineStart, lineStart + replaced.length);
      });
    },
    [onChange, value],
  );

  async function uploadImage(file: File) {
    setUploading(true);
    setNotice("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const payload = (await response.json()) as
        | { ok: true; data: { url: string; filename: string } }
        | { ok: false; error: { message: string } };
      if (!payload.ok) {
        setNotice(payload.error.message || "上传失败");
        return;
      }
      const markdown = `\n![${payload.data.filename}](${payload.data.url})\n`;
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        onChange(`${value.slice(0, start)}${markdown}${value.slice(start)}`);
      } else {
        onChange(`${value}${markdown}`);
      }
      setNotice("图片已插入");
    } catch {
      setNotice("网络异常，上传失败");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="rounded-[8px] border border-line bg-surface">
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap items-center gap-1 border-b border-line px-2 py-1.5">
        <div className="flex items-center gap-0.5 lg:hidden">
          <button
            type="button"
            onClick={() => setTab("edit")}
            className={cn(
              "inline-flex h-8 items-center gap-1 rounded-[6px] px-2 text-xs",
              tab === "edit" ? "bg-primary-soft text-primary" : "text-muted",
            )}
          >
            <PencilLine size={13} aria-hidden />
            编辑
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={cn(
              "inline-flex h-8 items-center gap-1 rounded-[6px] px-2 text-xs",
              tab === "preview" ? "bg-primary-soft text-primary" : "text-muted",
            )}
          >
            <Eye size={13} aria-hidden />
            预览
          </button>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-0.5">
          <ToolbarButton label="加粗" onClick={() => surround("**")}>
            <Bold size={14} aria-hidden />
          </ToolbarButton>
          <ToolbarButton label="斜体" onClick={() => surround("*")}>
            <Italic size={14} aria-hidden />
          </ToolbarButton>
          <ToolbarButton label="链接" onClick={() => surround("[", "](https://)")}>
            <Link2 size={14} aria-hidden />
          </ToolbarButton>
          <ToolbarButton label="代码块" onClick={() => surround("\n```ts\n", "\n```\n")}>
            <Code2 size={14} aria-hidden />
          </ToolbarButton>
          <ToolbarButton label="引用" onClick={() => prefixLines("> ")}>
            <Quote size={14} aria-hidden />
          </ToolbarButton>
          <ToolbarButton label="无序列表" onClick={() => prefixLines("- ")}>
            <List size={14} aria-hidden />
          </ToolbarButton>
          <span className="mx-1 h-4 w-px bg-[color:var(--border)]" aria-hidden />
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadImage(file);
            }}
          />
          <ToolbarButton
            label={uploading ? "上传中" : "插入图片"}
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus size={14} aria-hidden />
          </ToolbarButton>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-[color:var(--border)]">
        <div className={cn(tab === "preview" && "hidden lg:block")}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={rows}
            placeholder={placeholder}
            spellCheck={false}
            className="block w-full resize-y rounded-none border-0 bg-transparent px-4 py-3 font-mono text-[0.8125rem] leading-7 outline-none focus:ring-0"
            style={{ minHeight: `${rows * 1.75}rem` }}
          />
        </div>
        <div className={cn("min-h-[240px] overflow-auto px-4 py-3", tab === "edit" && "hidden lg:block")}>
          {loading ? <p className="text-xs text-muted">生成预览…</p> : null}
          {error ? (
            <p className="text-xs" role="alert" style={{ color: "var(--danger)" }}>
              {error}
            </p>
          ) : null}
          {html ? (
            <div className="prose-ledger" dangerouslySetInnerHTML={{ __html: html }} />
          ) : !loading && !error ? (
            <p className="text-xs text-muted">开始输入后，这里会显示渲染结果。</p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line px-3 py-1.5 text-[0.6875rem] text-muted">
        <span>{value.length} 字符</span>
        <span aria-live="polite">
          {notice || (tab === "preview" && html ? `约 ${Math.max(1, minutes)} 分钟读完` : "")}
        </span>
      </div>
    </div>
  );
}
