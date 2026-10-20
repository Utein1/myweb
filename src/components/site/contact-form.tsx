"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";

type Errors = Partial<Record<"name" | "email" | "subject" | "message", string>>;

export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const startedAt = useRef<number>(Date.now());
  const formRef = useRef<HTMLFormElement>(null);

  function focusFirstField(next: Errors) {
    const order: (keyof Errors)[] = ["name", "email", "subject", "message"];
    const first = order.find((key) => next[key]);
    if (!first || !formRef.current) return;
    const element = formRef.current.querySelector<HTMLElement>(`[name="${first}"]`);
    element?.focus();
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      subject: String(data.get("subject") ?? ""),
      message: String(data.get("message") ?? ""),
      website: String(data.get("website") ?? ""),
      startedAt: startedAt.current,
    };

    const nextErrors: Errors = {};
    if (!payload.name.trim()) nextErrors.name = "请填写称呼";
    else if (payload.name.trim().length > 30) nextErrors.name = "称呼最多 30 字";
    if (!payload.email.trim()) nextErrors.email = "请填写邮箱";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
      nextErrors.email = "请输入合法邮箱";
    }
    if (payload.message.trim().length < 10) nextErrors.message = "内容至少 10 个字";
    else if (payload.message.trim().length > 2000) nextErrors.message = "内容最多 2000 字";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("idle");
      setMessage("");
      focusFirstField(nextErrors);
      return;
    }

    setStatus("submitting");
    setMessage("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);
      if (response.ok && result?.ok) {
        setStatus("success");
        return;
      }
      if (response.status === 429) {
        setStatus("error");
        setMessage("提交过于频繁，请稍后再试。");
        return;
      }
      if (result?.error?.field) {
        const field = result.error.field as keyof Errors;
        const next = { [field]: result.error.message } as Errors;
        setErrors(next);
        focusFirstField(next);
      }
      setStatus("error");
      setMessage(result?.error?.message ?? "发送失败，请稍后重试或直接发邮件。");
    } catch {
      setStatus("error");
      setMessage("网络异常，发送失败。请稍后重试或直接发邮件。");
    }
  }

  if (status === "success") {
    return (
      <div
        className="rounded-[12px] border border-line bg-surface p-8"
        role="status"
        aria-live="polite"
      >
        <p className="font-serif text-xl font-medium">传讯已送达</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          感谢你的来信，通常会在 1-2 个工作日内回复。如果情况紧急，也可以直接发邮件。
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="称呼" htmlFor="contact-name" required error={errors.name}>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            maxLength={30}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            placeholder="怎么称呼你"
          />
        </Field>
        <Field label="邮箱" htmlFor="contact-email" required error={errors.email}>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            placeholder="you@example.com"
          />
        </Field>
      </div>
      <Field label="主题" htmlFor="contact-subject" hint="选填，最多 60 字">
        <Input id="contact-subject" name="subject" maxLength={60} placeholder="想聊点什么" />
      </Field>
      <Field label="内容" htmlFor="contact-message" required error={errors.message} hint="10-2000 字">
        <Textarea
          id="contact-message"
          name="message"
          rows={7}
          maxLength={2000}
          aria-invalid={Boolean(errors.message)}
          placeholder="项目合作、技术交流，或只是打个招呼。"
        />
      </Field>

      {/* 蜜罐字段：正常访客不可见 */}
      <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" loading={status === "submitting"}>
          <Send size={16} aria-hidden />
          发送传讯
        </Button>
        <p className="text-xs text-muted">通常 1-2 个工作日内回复。</p>
      </div>

      <div aria-live="polite">
        {status === "error" && message ? (
          <p
            className="rounded-[8px] border px-3 py-2 text-sm"
            style={{
              color: "var(--danger)",
              borderColor: "color-mix(in srgb, var(--danger) 35%, transparent)",
              backgroundColor: "color-mix(in srgb, var(--danger) 8%, transparent)",
            }}
          >
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
