"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Mail, MailOpen, Reply, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deleteMessageAction, markMessageAction } from "@/actions/messages";

export type MessageItem = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  readAt: string | null;
};

export function MessageInbox({ messages }: { messages: MessageItem[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [optimisticRead, setOptimisticRead] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  const selected = messages.find((item) => item.id === selectedId) ?? null;

  function isUnread(item: MessageItem) {
    return !item.readAt && !optimisticRead[item.id];
  }

  async function mark(id: string, read: boolean) {
    const body = new FormData();
    body.set("id", id);
    body.set("read", read ? "1" : "0");
    setOptimisticRead((current) => ({ ...current, [id]: read }));
    await markMessageAction(body).catch(() => setError("操作失败，请重试"));
    router.refresh();
  }

  function open(item: MessageItem) {
    setSelectedId(item.id);
    if (isUnread(item)) void mark(item.id, true);
  }

  async function remove(item: MessageItem) {
    if (!window.confirm(`确定删除来自「${item.name}」的传讯吗？`)) return;
    const body = new FormData();
    body.set("id", item.id);
    await deleteMessageAction(body);
    setSelectedId(null);
    router.refresh();
  }

  return (
    <>
      {error ? (
        <p className="mb-3 text-sm" role="alert" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      ) : null}

      {messages.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-line px-6 py-12 text-center">
          <p className="font-serif text-lg">暂无传讯</p>
          <p className="mt-2 text-sm text-muted">访客通过联系页提交的内容会出现在这里。</p>
        </div>
      ) : (
        <ul className="divide-y divide-[color:var(--border)] rounded-[12px] border border-line bg-surface">
          {messages.map((item) => {
            const unread = isUnread(item);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => open(item)}
                  className="flex w-full flex-wrap items-center gap-3 p-4 text-left transition-colors hover:bg-primary-soft/40"
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      unread ? "bg-primary-soft text-primary" : "bg-surface2 text-muted",
                    )}
                    aria-hidden
                  >
                    {unread ? <Mail size={15} /> : <MailOpen size={15} />}
                  </span>
                  <span className="min-w-[140px] flex-1">
                    <span className={cn("block text-sm", unread && "font-semibold")}>
                      {item.subject || "（无主题）"}
                    </span>
                    <span className="caption mt-0.5 block text-muted">
                      {item.name} · {item.email}
                    </span>
                  </span>
                  <span className="caption shrink-0 text-muted">
                    {new Date(item.createdAt).toLocaleString("zh-CN", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {unread ? <Badge tone="primary">未读</Badge> : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="传讯详情"
        >
          <button
            type="button"
            aria-label="关闭详情"
            className="absolute inset-0 bg-[var(--overlay)]"
            onClick={() => setSelectedId(null)}
          />
          <div className="relative z-10 flex h-full w-[min(520px,92vw)] flex-col border-l border-line bg-bg shadow-[var(--shadow-lg)]">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div className="min-w-0">
                <p className="truncate font-serif text-lg font-medium">
                  {selected.subject || "（无主题）"}
                </p>
                <p className="caption mt-0.5 text-muted">
                  {selected.name} · {selected.email}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="关闭"
                onClick={() => setSelectedId(null)}
              >
                <X size={16} aria-hidden />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <p className="caption text-muted">
                {new Date(selected.createdAt).toLocaleString("zh-CN")}
              </p>
              <div className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed">
                {selected.message}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-4">
              <a
                href={`mailto:${selected.email}?subject=${encodeURIComponent(
                  selected.subject ? `Re: ${selected.subject}` : "来自冒险者档案的回复",
                )}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-primary px-3 text-[0.8125rem] font-medium text-[color:var(--primary-contrast)]"
              >
                <Reply size={14} aria-hidden />
                回复邮件
              </a>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void mark(selected.id, false)}
              >
                <Mail size={14} aria-hidden />
                标记未读
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void mark(selected.id, true)}
              >
                <Check size={14} aria-hidden />
                标记已读
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => void remove(selected)}
              >
                <Trash2 size={14} aria-hidden style={{ color: "var(--danger)" }} />
                <span style={{ color: "var(--danger)" }}>删除</span>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
