import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/server/queries/site";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "档案管理台",
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const [settings, unread] = await Promise.all([
    getSiteSettings(),
    prisma.contactMessage.count({ where: { readAt: null } }),
  ]);

  return (
    <AdminShell
      siteName={settings.siteName}
      email={session.email}
      emblemUrl={settings.emblemUrl}
      unread={unread}
      logoutAction={logoutAction}
    >
      {children}
    </AdminShell>
  );
}
