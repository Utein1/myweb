import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { renderMarkdown } from "@/lib/markdown";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTHORIZED", message: "登录已过期" } },
      { status: 401 },
    );
  }

  let payload: { content?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: { message: "请求格式不正确" } }, { status: 400 });
  }

  const content = typeof payload.content === "string" ? payload.content : "";
  const { html, toc, minutes } = await renderMarkdown(content.slice(0, 200000));
  return NextResponse.json({ ok: true, data: { html, toc, minutes } });
}
