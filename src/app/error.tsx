"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 生产环境只记录摘要，不泄漏堆栈
    console.error("页面渲染失败", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">出错了</p>
      <h1 className="page-title mt-3">页面加载失败</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        可能是网络波动或服务暂时不可用。可以重试一次；如果持续失败，请稍后再来。
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-xs text-muted">错误编号：{error.digest}</p>
      ) : null}
      <Button type="button" className="mt-6" onClick={reset}>
        <RefreshCw size={16} aria-hidden />
        重试
      </Button>
    </div>
  );
}
