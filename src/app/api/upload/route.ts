import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { saveUpload } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTHORIZED", message: "登录已过期，请重新登录" } },
      { status: 401 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "BAD_REQUEST", message: "上传数据不正确" } },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: { code: "VALIDATION", message: "请选择要上传的文件" } },
      { status: 400 },
    );
  }

  try {
    const stored = await saveUpload(file);
    const media = await prisma.media.create({
      data: {
        key: stored.key,
        url: stored.url,
        filename: stored.filename.slice(0, 120),
        mimeType: stored.mimeType,
        size: stored.size,
        width: stored.width,
        height: stored.height,
      },
    });
    return NextResponse.json({ ok: true, data: media });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UPLOAD_FAILED",
          message: error instanceof Error ? error.message : "上传失败，请重试",
        },
      },
      { status: 400 },
    );
  }
}
