import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  { ext: "jpg", mime: "image/jpeg", label: "JPG" },
  { ext: "png", mime: "image/png", label: "PNG" },
  { ext: "webp", mime: "image/webp", label: "WebP" },
  { ext: "avif", mime: "image/avif", label: "AVIF" },
  { ext: "gif", mime: "image/gif", label: "GIF" },
] as const;

export type StoredFile = {
  key: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
};

function detectMagic(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "image/png";
  }
  if (buffer.subarray(0, 4).toString("ascii") === "GIF8") return "image/gif";
  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  const brand = buffer.subarray(4, 12).toString("ascii");
  if (brand.startsWith("ftyp") && (brand.includes("avif") || brand.includes("avis"))) {
    return "image/avif";
  }
  return null;
}

async function bucket() {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.MEDIA) {
    throw new Error("缺少 R2 绑定 MEDIA，请检查 wrangler.jsonc");
  }
  return env.MEDIA;
}

export async function saveUpload(file: File): Promise<StoredFile> {
  if (file.size === 0) throw new Error("文件为空");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("文件超过 5MB 限制");

  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = detectMagic(buffer);
  if (!mime) throw new Error("仅支持 JPG / PNG / WebP / AVIF / GIF 图片（SVG 已禁用）");

  const allowed = ALLOWED_IMAGE_TYPES.find((item) => item.mime === mime);
  if (!allowed) throw new Error("仅支持 JPG / PNG / WebP / AVIF / GIF 图片（SVG 已禁用）");

  const now = new Date();
  const folder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const key = `${folder}/${randomUUID()}.${allowed.ext}`;
  const filename = file.name || `upload.${allowed.ext}`;

  await (await bucket()).put(key, buffer, {
    httpMetadata: {
      contentType: mime,
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  return {
    key,
    url: `/uploads/${key}`,
    filename,
    mimeType: mime,
    size: file.size,
    // Workers 里没有 sharp；尺寸留空，不影响列表与正文展示
    width: null,
    height: null,
  };
}

/** 删除 R2 中的对象（媒体库删除时调用） */
export async function deleteUpload(key: string) {
  try {
    await (await bucket()).delete(key);
  } catch {
    // 对象已不存在或绑定异常时不阻塞数据库清理
  }
}

/** 内容指纹，用于媒体引用检查 */
export function contentKey(url: string) {
  return createHash("sha1").update(url).digest("hex");
}
