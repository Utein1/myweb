"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  variant = "secondary",
  size = "sm",
  className,
  confirm,
  ...props
}: ComponentProps<typeof Button> & { confirm?: string; children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      loading={pending}
      className={cn(className)}
      onClick={(event) => {
        if (confirm && !window.confirm(confirm)) {
          event.preventDefault();
        }
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

export function DeleteForm({
  action,
  id,
  label = "删除",
  confirmText = "确定要删除吗？此操作不可撤销。",
  extra,
  className,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label?: string;
  confirmText?: string;
  extra?: Record<string, string>;
  className?: string;
}) {
  return (
    <form action={action} className={cn("inline-flex", className)}>
      <input type="hidden" name="id" value={id} />
      {extra
        ? Object.entries(extra).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))
        : null}
      <SubmitButton variant="ghost" confirm={confirmText} aria-label={label}>
        <span style={{ color: "var(--danger)" }}>{label}</span>
      </SubmitButton>
    </form>
  );
}
