import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

/**
 * Cloudflare 部署配置。
 * 增量缓存放在 R2（NEXT_INC_CACHE_R2_BUCKET），
 * 页面上的 revalidate = 300 与 revalidatePath 都会写入这里。
 */
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
