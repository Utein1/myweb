import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma CLI 配置。
 * 应用运行时不读这里的连接串：Workers 里通过 @prisma/adapter-d1 使用 D1 绑定。
 * 这里的 DATABASE_URL 只服务于 `prisma migrate diff` 等 CLI 命令。
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
