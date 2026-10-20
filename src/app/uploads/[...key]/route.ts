import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * 媒体文件读取：上传的图片存在 R2（MEDIA 绑定），
 * URL 保持 /uploads/<key>，与历史内容一致。
 * 构建期就在 public/uploads 里的老文件由静态资源直接命中，不会进入这里。
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const objectKey = key.map((part) => decodeURIComponent(part)).join("/");

  const { env } = await getCloudflareContext({ async: true });
  if (!env.MEDIA) {
    return new Response("存储未配置", { status: 500 });
  }

  const object = await env.MEDIA.get(objectKey);
  if (!object) {
    return new Response("Not Found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");

  return new Response(object.body, { headers });
}
