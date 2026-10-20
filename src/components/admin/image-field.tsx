"use client";

import { useId, useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

type UploadResponse =
  | { ok: true; data: { id: string; url: string } }
  | { ok: false; error: { message: string } };

export function ImageField({
  name,
  label,
  hint,
  defaultValue = "",
  aspect = "16 / 9",
  shape = "rect",
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string;
  aspect?: string;
  shape?: "rect" | "round";
}) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const payload = (await response.json()) as UploadResponse;
      if (!payload.ok) {
        setError(payload.error.message || "上传失败，请重试");
        return;
      }
      setUrl(payload.data.url);
    } catch {
      setError("网络异常，上传失败，请重试");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="field-label" htmlFor={inputId}>
        {label}
      </label>
      <input type="hidden" name={name} value={url} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div
          className="flex w-full max-w-[220px] items-center justify-center overflow-hidden border border-line bg-surface2"
          style={{
            aspectRatio: aspect,
            borderRadius: shape === "round" ? "999px" : "8px",
            maxWidth: shape === "round" ? 96 : undefined,
          }}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt=""
              className="h-full w-full"
              style={{ objectFit: shape === "round" ? "cover" : "cover" }}
            />
          ) : (
            <span className="flex flex-col items-center gap-1 py-6 text-xs text-muted">
              <ImagePlus size={20} aria-hidden />
              未选择图片
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              loading={busy}
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={14} aria-hidden />
              {url ? "替换图片" : "上传图片"}
            </Button>
            {url ? (
              <Button type="button" size="sm" variant="ghost" onClick={() => setUrl("")}>
                <Trash2 size={14} aria-hidden />
                移除
              </Button>
            ) : null}
          </div>
          <Input
            id={inputId}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="/uploads/... 或 https://..."
            aria-label={`${label}地址`}
          />
          <p className="field-hint">
            {hint ?? "支持 JPG / PNG / WebP / AVIF / GIF，单文件不超过 5MB。"}
          </p>
          {error ? (
            <p className="text-xs" role="alert" style={{ color: "var(--danger)" }}>
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
