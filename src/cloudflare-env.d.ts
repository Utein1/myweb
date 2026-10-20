// Cloudflare 绑定类型。与 wrangler.jsonc 中的 binding 名称保持一致。
// 新增绑定后记得同步这里（或执行 `npm run cf-typegen` 用 wrangler 自动生成）。
interface CloudflareEnv {
  /** D1：应用数据库 */
  DB: D1Database;
  /** R2：上传的媒体文件 */
  MEDIA: R2Bucket;
  /** R2：Next.js ISR 增量缓存 */
  NEXT_INC_CACHE_R2_BUCKET: R2Bucket;
  /** 静态资源 */
  ASSETS: Fetcher;
  /** 自身 service binding */
  WORKER_SELF_REFERENCE: Fetcher;
  SITE_URL?: string;
  AUTH_SECRET?: string;
  CRON_SECRET?: string;
}
