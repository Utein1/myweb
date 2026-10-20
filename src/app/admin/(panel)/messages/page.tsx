import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/panel";
import { MessageInbox, type MessageItem } from "@/components/admin/message-inbox";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ read?: string }>;
}) {
  const { read = "all" } = await searchParams;
  const where =
    read === "unread" ? { readAt: null } : read === "read" ? { readAt: { not: null } } : {};

  const [rows, unread] = await Promise.all([
    prisma.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.contactMessage.count({ where: { readAt: null } }),
  ]);

  const messages: MessageItem[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject ?? "",
    message: row.message,
    createdAt: row.createdAt.toISOString(),
    readAt: row.readAt?.toISOString() ?? null,
  }));

  const tabs = [
    { value: "all", label: "全部" },
    { value: "unread", label: `未读${unread > 0 ? ` (${unread})` : ""}` },
    { value: "read", label: "已读" },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Messages"
        title="传讯收件箱"
        description="访客通过联系页提交的内容。打开详情会自动标记为已读，回复按钮会唤起本机邮件客户端。"
      />

      <nav className="mb-5 flex flex-wrap gap-1.5" aria-label="按已读状态筛选">
        {tabs.map((tab) => {
          const active = read === tab.value;
          return (
            <Link
              key={tab.value}
              href={tab.value === "all" ? "/admin/messages" : `/admin/messages?read=${tab.value}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-8 items-center rounded-full border px-3 text-xs transition-colors",
                active
                  ? "border-transparent bg-primary text-[color:var(--primary-contrast)]"
                  : "border-line text-muted hover:border-line-strong hover:text-ink",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <MessageInbox messages={messages} />
    </>
  );
}
