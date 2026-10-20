"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, FileText, ImageIcon, LayoutGrid, List, Pencil, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { deleteMediaAction, renameMediaAction } from "@/actions/media";

export type MediaItem = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  createdAt: string;
  refs: number;
};

function formatSize(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

type UploadResponse =
  | { ok: true; data: { id: string } }
  | { ok: false; error: { message: string } };

export function MediaLibrary({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [renaming, setRenaming] = useState<{ id: string; value: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function copy(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(message);
      window.setTimeout(() => setNotice(""), 1800);
    } catch {
      setError("复制失败，请手动选择文本复制");
    }
  }

  async function uploadFiles(files: File[]) {
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    setNotice("");
    let uploaded = 0;
    for (const [index, file] of files.entries()) {
      setProgress(`上传中 ${index + 1}/${files.length}：${file.name}`);
      try {
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/upload", { method: "POST", body });
        const payload = (await response.json()) as UploadResponse;
        if (!payload.ok) {
          setError(`${file.name}：${payload.error.message || "上传失败"}`);
          break;
        }
        uploaded += 1;
      } catch {
        setError(`${file.name}：网络异常，上传失败`);
        break;
      }
    }
    setProgress("");
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    if (uploaded > 0) {
      setNotice(`已上传 ${uploaded} 个文件`);
      window.setTimeout(() => setNotice(""), 1800);
      router.refresh();
    }
  }

  async function remove(item: MediaItem) {
    if (!window.confirm(`确定删除「${item.filename}」吗？`)) return;
    if (item.refs > 0 && !window.confirm(`该文件被 ${item.refs} 处内容引用，删除后这些位置会显示占位图。仍要删除吗？`)) {
      return;
    }
    const body = new FormData();
    body.set("id", item.id);
    if (item.refs > 0) body.set("force", "1");
    await deleteMediaAction(body);
    setSelected(null);
    router.refresh();
  }

  async function rename(id: string, value: string) {
    const clean = value.trim();
    if (!clean) {
      setError("文件名不能为空");
      return;
    }
    const body = new FormData();
    body.set("id", id);
    body.set("filename", clean);
    const result = await renameMediaAction(null, body);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setRenaming(null);
    setError("");
    router.refresh();
  }

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void uploadFiles(Array.from(event.dataTransfer.files));
        }}
        className={cn(
          "mb-5 flex flex-col items-center justify-center rounded-[12px] border border-dashed px-6 py-8 text-center transition-colors",
          dragging ? "border-primary bg-primary-soft" : "border-line bg-surface/60",
        )}
      >
        <ImageIcon size={26} aria-hidden className="text-muted" />
        <p className="mt-3 text-sm">拖拽图片到这里，或点击选择文件</p>
        <p className="mt-1 text-xs text-muted">
          JPG / PNG / WebP / AVIF / GIF，单文件不超过 5MB，可多选。SVG 已禁用。
        </p>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
          className="sr-only"
          onChange={(event) => {
            if (event.target.files?.length) void uploadFiles(Array.from(event.target.files));
          }}
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-4"
          loading={uploading}
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={14} aria-hidden />
          选择文件
        </Button>
        {progress ? <p className="mt-2 text-xs text-muted">{progress}</p> : null}
      </div>

      <div aria-live="polite" className="mb-3 min-h-5 text-sm">
        {error ? (
          <span style={{ color: "var(--danger)" }}>{error}</span>
        ) : notice ? (
          <span className="inline-flex items-center gap-1.5" style={{ color: "var(--success)" }}>
            <Check size={14} aria-hidden />
            {notice}
          </span>
        ) : null}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted">共 {items.length} 个文件（当前页）</p>
        <div className="flex items-center gap-1" role="group" aria-label="切换视图">
          <button
            type="button"
            aria-pressed={view === "grid"}
            aria-label="网格视图"
            onClick={() => setView("grid")}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-[6px]",
              view === "grid" ? "bg-primary-soft text-primary" : "text-muted hover:text-ink",
            )}
          >
            <LayoutGrid size={15} aria-hidden />
          </button>
          <button
            type="button"
            aria-pressed={view === "list"}
            aria-label="列表视图"
            onClick={() => setView("list")}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-[6px]",
              view === "list" ? "bg-primary-soft text-primary" : "text-muted hover:text-ink",
            )}
          >
            <List size={15} aria-hidden />
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-line px-6 py-12 text-center">
          <p className="font-serif text-lg">媒体库是空的</p>
          <p className="mt-2 text-sm text-muted">上传第一张图片，就可以在正文与封面里引用它。</p>
        </div>
      ) : view === "grid" ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-[12px] border border-line bg-surface">
              <button
                type="button"
                className="block w-full"
                onClick={() => setSelected(item)}
                aria-label={`查看 ${item.filename}`}
              >
                <span className="block aspect-[4/3] overflow-hidden bg-surface2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                </span>
              </button>
              <div className="p-2.5">
                <p className="truncate text-xs" title={item.filename}>
                  {item.filename}
                </p>
                <p className="caption mt-0.5 text-muted">
                  {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
                  {formatSize(item.size)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="divide-y divide-[color:var(--border)] rounded-[12px] border border-line bg-surface">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-3 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt=""
                className="h-12 w-16 shrink-0 rounded-[4px] border border-line object-cover"
                loading="lazy"
              />
              <div className="min-w-[160px] flex-1">
                {renaming?.id === item.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={renaming.value}
                      onChange={(event) => setRenaming({ id: item.id, value: event.target.value })}
                      aria-label="新文件名"
                      className="h-8 max-w-[260px]"
                    />
                    <Button type="button" size="sm" onClick={() => void rename(item.id, renaming.value)}>
                      保存
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setRenaming(null)}>
                      取消
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="block truncate text-left text-sm hover:text-primary"
                  >
                    {item.filename}
                  </button>
                )}
                <p className="caption mt-0.5 text-muted">
                  {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
                  {formatSize(item.size)} · {new Date(item.createdAt).toLocaleDateString("zh-CN")}
                  {item.refs > 0 ? ` · 被引用 ${item.refs} 次` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void copy(item.url, "图片地址已复制")}
                >
                  <Copy size={14} aria-hidden />
                  URL
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    void copy(`![${item.filename}](${item.url})`, "Markdown 已复制")
                  }
                >
                  <FileText size={14} aria-hidden />
                  Markdown
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRenaming({ id: item.id, value: item.filename })}
                >
                  <Pencil size={14} aria-hidden />
                  重命名
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => void remove(item)}>
                  <Trash2 size={14} aria-hidden style={{ color: "var(--danger)" }} />
                  删除
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={selected.filename}>
          <button
            type="button"
            aria-label="关闭"
            className="absolute inset-0 bg-[var(--overlay)]"
            onClick={() => setSelected(null)}
          />
          <div className="relative z-10 w-full max-w-[720px] overflow-hidden rounded-[16px] border border-line bg-surface shadow-[var(--shadow-lg)]">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <p className="truncate text-sm font-medium">{selected.filename}</p>
              {selected.refs > 0 ? <Badge tone="warning">被引用 {selected.refs} 次</Badge> : null}
            </div>
            <div className="max-h-[60vh] overflow-auto bg-surface2 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selected.url} alt={selected.filename} className="mx-auto max-h-[52vh] w-auto" />
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-line p-4">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => void copy(selected.url, "图片地址已复制")}
              >
                <Copy size={14} aria-hidden />
                复制地址
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() =>
                  void copy(`![${selected.filename}](${selected.url})`, "Markdown 已复制")
                }
              >
                <FileText size={14} aria-hidden />
                复制 Markdown
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setRenaming({ id: selected.id, value: selected.filename });
                  setSelected(null);
                }}
              >
                <Pencil size={14} aria-hidden />
                重命名
              </Button>
              <div className="ml-auto flex items-center gap-2">
                <Button type="button" size="sm" variant="ghost" onClick={() => setSelected(null)}>
                  关闭
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={() => void remove(selected)}
                >
                  <Trash2 size={14} aria-hidden />
                  删除
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
