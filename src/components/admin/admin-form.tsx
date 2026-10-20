"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/schemas";
import { cn } from "@/lib/utils";

type FormAction = (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;

export function AdminForm({
  action,
  children,
  submitLabel = "保存",
  className,
  extraActions,
  compact = false,
}: {
  action: FormAction;
  children: ReactNode;
  submitLabel?: string;
  className?: string;
  extraActions?: ReactNode;
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className={className}>
      {children}
      <div
        className={cn(
          "flex flex-wrap items-center gap-3",
          compact ? "mt-2" : "mt-6 border-t border-line pt-5",
        )}
      >
        <Button type="submit" size={compact ? "sm" : "md"} loading={pending}>
          {submitLabel}
        </Button>
        {extraActions}
        {state?.ok ? (
          <span role="status" className="text-sm" style={{ color: "var(--success)" }}>
            已保存
          </span>
        ) : null}
        {state && !state.ok ? (
          <span role="alert" className="text-sm" style={{ color: "var(--danger)" }}>
            {state.error.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
