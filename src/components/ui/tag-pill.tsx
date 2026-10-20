import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TagPill({
  children,
  href,
  className,
  title,
}: {
  children: ReactNode;
  href?: string;
  className?: string;
  title?: string;
}) {
  const classes = cn(
    "caption inline-flex h-6 items-center rounded-full border border-line px-2.5 text-muted transition-colors",
    href && "hover:border-line-strong hover:bg-primary-soft hover:text-ink",
    className,
  );
  if (href) {
    return (
      <Link href={href} className={classes} title={title}>
        {children}
      </Link>
    );
  }
  return <span className={classes}>{children}</span>;
}
