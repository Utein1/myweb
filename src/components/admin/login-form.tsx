"use client";

import { useActionState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { loginAction, type LoginState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <Field label="邮箱" htmlFor="email" required>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          placeholder="admin@example.com"
        />
      </Field>
      <Field label="密码" htmlFor="password" required>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </Field>
      <label className="flex h-9 items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          name="remember"
          className="h-4 w-4"
          style={{ accentColor: "var(--primary)" }}
        />
        记住我（30 天）
      </label>

      <div aria-live="polite">
        {state?.error ? (
          <p
            className="rounded-[8px] border px-3 py-2 text-sm"
            style={{
              color: "var(--danger)",
              borderColor: "color-mix(in srgb, var(--danger) 35%, transparent)",
              backgroundColor: "color-mix(in srgb, var(--danger) 8%, transparent)",
            }}
          >
            {state.error}
          </p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" size="lg" loading={pending}>
        <LockKeyhole size={16} aria-hidden />
        登录
        <ArrowRight size={16} aria-hidden />
      </Button>
    </form>
  );
}
