# 冒险者档案（Adventurer's Ledger）

按 [`docs/PRD.md`](docs/PRD.md) 实现的个人站与内容管理后台。前台是「冒险者手账」的视觉包装，后台是单人使用的轻量 CMS：所有内容存在数据库里，改完保存即可在线上看到，不需要重新部署。

## 技术栈

- Next.js 15（App Router / React Server Components / Server Actions）
- React 19 + TypeScript（`strict`）
- Tailwind CSS 4，设计令牌以 CSS 变量实现深浅两套主题
- Prisma 6 + SQLite（本地开箱即用，可切换 Postgres）
- Zod 校验、bcrypt 密码哈希、jose JWT 会话
- unified（remark + rehype + rehype-sanitize + rehype-pretty-code）Markdown 渲染
- lucide-react 图标

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 准备环境变量（首次）
#    Windows PowerShell: Copy-Item .env.example .env
cp .env.example .env

# 3. 生成 Prisma Client、建表并写入示例内容（管理员、4 个委托、7 篇手记、技能树、站点设置）
npm run setup

# 4. 启动开发服务器
npm run dev
```

打开 <http://localhost:3000>。

### 后台登录

地址：<http://localhost:3000/admin/login>

默认账号来自 `.env` 的 seed 配置：

```text
邮箱：admin@example.com
密码：admin12345
```

首次部署后请修改 `.env` 中的 `ADMIN_EMAIL` / `ADMIN_PASSWORD` 并重新执行 seed，或在后台「站点设置」中修改密码。生产环境务必替换 `AUTH_SECRET`。

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 开发服务器 |
| `npm run build` | 生产构建（含 `prisma generate`） |
| `npm start` | 启动生产服务器 |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run setup` | 生成客户端 + 建表 + seed（本地首次启动） |
| `npm run db:seed` | 重新写入示例内容（幂等，不会覆盖已有管理员） |
| `npm run db:studio` | Prisma Studio 查看数据 |

## 目录结构

```text
prisma/          schema、seed（示例内容与封面图生成）
public/          头像、默认 OG 图、项目封面、本地上传目录
src/app/(site)/  公开前台：首页、关于、技能、委托、手记、联系
src/app/admin/   档案管理台：仪表盘、设置、个人信息、技能、委托、手记、媒体、传讯
src/app/api/     联系表单、上传、定时发布、Markdown 预览
src/actions/     Server Actions（写操作，全部内置会话校验）
src/server/      查询层（公开查询统一过滤未发布内容）
src/components/  ui 原子组件、site 前台组件、admin 后台组件
src/lib/         鉴权、数据库、Markdown、SEO、存储、限流等
src/schemas/     Zod schema（前后端共用）
docs/PRD.md      产品需求文档
```

## 内容维护

登录后台后：

- **站点设置**：站点名、签名、徽记、主色、SEO 默认值、社交链接、页脚、简历 PDF、RSS 模式。
- **个人信息**：登记卡字段、自述长文、履历（可排序）。
- **技能**：分类与技能项，熟练度 1-5，支持「学习中」标记。
- **委托**：封面、图集、技术栈标签、外链、正文、精选与发布状态。
- **手记**：Markdown 编辑器（分栏预览、快捷键、草稿自动保存）、置顶、定时发布。
- **媒体库**：上传图片（JPG/PNG/WebP/AVIF/GIF，≤5MB，SVG 禁用），复制地址或 Markdown。
- **传讯**：联系表单收件箱，打开自动标记已读。

保存/发布后会通过 `revalidateTag` 主动刷新前台缓存；另有 `revalidate = 300` 兜底，最迟 5 分钟收敛。

## 环境变量

见 `.env.example`，关键项：

| 变量 | 说明 |
| --- | --- |
| `DATABASE_URL` | 本地默认 `file:./dev.db` |
| `AUTH_SECRET` | 会话签名密钥，至少 32 字节 |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | seed 创建的管理员 |
| `SITE_URL` | 对外地址，用于 canonical / sitemap / RSS / OG |
| `STORAGE_DRIVER` | `local`（默认，写入 `public/uploads`）、`vercel-blob` 或 `s3` |
| `NEXT_PUBLIC_STORAGE_HOST` | 远程存储域名，用于 `next/image` 白名单 |
| `CRON_SECRET` | `/api/cron/publish` 的访问密钥 |

任何 `NEXT_PUBLIC_` 变量都会进入客户端 bundle，不要放密钥。

## 切换到 Postgres

本地为了零依赖启动使用 SQLite。生产建议 Postgres（Neon / Supabase / RDS）：

1. 将 `prisma/schema.prisma` 的 `datasource db.provider` 改为 `postgresql`。
2. 配置 `DATABASE_URL`（池化连接），迁移时使用直连串。
3. 执行 `npx prisma migrate deploy`（生产环境不要用 `db push`）。
4. 重新执行 seed 或导入现有数据。

状态字段目前以字符串存储（`PLANNED` / `IN_PROGRESS` / `COMPLETED` / `ARCHIVED`、`DRAFT` / `PUBLISHED` / `SCHEDULED`），切换 Postgres 时可改为原生 enum。

## 定时发布

`GET /api/cron/publish` 会把 `publishedAt <= now` 的定时手记转为已发布并刷新缓存，需要携带密钥：

```text
/api/cron/publish?secret=<CRON_SECRET>
```

Vercel Cron 或 Cloudflare Cron Trigger 均可调用；即使不配置 Cron，5 分钟兜底缓存也会让内容上线。

## 上线前检查

对照 `docs/PRD.md` 附录 C：

- 替换所有示例凭据与 `AUTH_SECRET`，`SITE_URL` 指向正式域名。
- 确认草稿直链返回 404、`/admin` 未登录跳转登录页。
- 检查 `npm audit`、Lighthouse（移动端 Performance ≥ 90、无障碍 ≥ 95）。
- 为生产数据库配置备份，并验证一次恢复流程。
- 若使用境外托管，页脚保留「粉丝向作品」声明；若部署在境内，补充 ICP 备案号。
