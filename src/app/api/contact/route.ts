import { NextResponse } from "next/server";
import { contactSchema } from "@/schemas";
import { prisma } from "@/lib/db";
import { sha256 } from "@/lib/hash";
import { isContactRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "BAD_REQUEST", message: "请求格式不正确" } },
      { status: 400 },
    );
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "VALIDATION",
          message: first?.message ?? "输入不合法",
          field: first?.path?.[0]?.toString(),
        },
      },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // 蜜罐命中：静默成功，不写库
  if (data.website.trim()) {
    return NextResponse.json({ ok: true });
  }
  // 提交过快：静默成功，不写库
  if (!data.startedAt || Date.now() - data.startedAt < 3000) {
    return NextResponse.json({ ok: true });
  }

  const ip = clientIp(request);
  const ipHash = await sha256(ip);

  if (await isContactRateLimited(ipHash)) {
    return NextResponse.json(
      { ok: false, error: { code: "RATE_LIMITED", message: "提交过于频繁，请稍后再试" } },
      { status: 429 },
    );
  }

  await prisma.contactMessage.create({
    data: {
      name: data.name,
      email: data.email,
      subject: data.subject || null,
      message: data.message,
      ip: ipHash,
      userAgent: request.headers.get("user-agent")?.slice(0, 255) ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
