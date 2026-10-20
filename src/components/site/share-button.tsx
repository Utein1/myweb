"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={copy}>
        {copied ? <Check size={15} aria-hidden /> : <Link2 size={15} aria-hidden />}
        {copied ? "已复制链接" : "复制链接"}
      </Button>
      <span className="sr-only" aria-live="polite">
        {copied ? `${title} 的链接已复制` : ""}
      </span>
    </>
  );
}
