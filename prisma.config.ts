import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma CLI 配置。
 * 应用运行时不读这里的连接串：Workers 里通过 @prisma/adapter-d1 使用 D1 绑定。
 * 这里的 DATABASE_URL 只服务于 `prisma migrate diff` 等 CLI 命令。
 *
 * CI / 构建环境（Cloudflare Builds 等）没有 .env，也不应该拿到生产连接串。
 * `prisma generate` 只需要一个合法的 URL 占位值即可完成代码生成，
 * 所以这里在缺少环境变量时回退到本地 SQLite 占位，避免 postinstall 直接失败。
 */
const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
