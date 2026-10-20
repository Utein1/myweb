import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[8px] font-medium transition-colors duration-150 whitespace-nowrap disabled:opacity-55 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-[color:var(--primary-contrast)] hover:bg-[color:var(--primary)] hover:brightness-[0.94]",
  secondary: "border border-line bg-surface text-ink hover:border-line-strong",
  ghost: "text-ink hover:bg-primary-soft",
  danger: "bg-danger text-white hover:brightness-95",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-[0.8125rem]",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-[0.9375rem]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClass(variant, size, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="spinner" aria-hidden /> : null}
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}

export function IconButton({
  className,
  children,
  label,
  ...props
}: ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-[8px] text-muted transition-colors hover:bg-primary-soft hover:text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
