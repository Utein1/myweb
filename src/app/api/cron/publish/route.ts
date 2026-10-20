import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;
  const url = new URL(request.url);
  return url.searchParams.get("secret") === secret;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTHORIZED", message: "未授权" } },
      { status: 401 },
    );
  }

  const now = new Date();
  const result = await prisma.post.updateMany({
    where: { status: "SCHEDULED", publishedAt: { not: null, lte: now } },
    data: { status: "PUBLISHED" },
  });

  if (result.count > 0) {
    revalidatePath("/", "layout");
  }

  return NextResponse.json({ ok: true, published: result.count, at: now.toISOString() });
}
