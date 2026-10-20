"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyTextButton({
  value,
  label = "复制",
  copiedLabel = "已复制",
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setFailed(false);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setFailed(true);
    }
  }

  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={copy}>
        {copied ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
        {copied ? copiedLabel : label}
      </Button>
      <span className="sr-only" aria-live="polite">
        {copied ? "已复制到剪贴板" : failed ? "复制失败，请手动复制" : ""}
      </span>
    </>
  );
}
