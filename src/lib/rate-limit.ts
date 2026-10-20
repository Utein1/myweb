import "server-only";
import { prisma } from "@/lib/db";

/** 登录限流：基于数据库计数，跨实例一致（联系表单用） */
export async function isContactRateLimited(ipHash: string) {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const count = await prisma.contactMessage.count({
    where: { ip: ipHash, createdAt: { gte: since } },
  });
  return count >= 5;
}
