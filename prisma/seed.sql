-- 初始数据：由本地 prisma/dev.db 导出，供 D1 初始化使用。
-- 用法：wrangler d1 execute adventurer-ledger-db --remote --file=prisma/seed.sql
PRAGMA defer_foreign_keys = ON;

-- AdminUser (1)
INSERT INTO "AdminUser" ("id", "email", "passwordHash", "name", "failedAttempts", "lockedUntil", "lastLoginAt", "createdAt", "updatedAt") VALUES ('cmvga3pel0000wsr0hh7l6syb', 'admin@example.com', '$2b$12$GA4b01zC3PcBRKmePXhqdedxt1QT6Fu8efAAXId8feJIG2s2WrX4C', '档案管理员', 0, NULL, 1792479443396, 1792476290397, 1792479443398);

-- SiteSetting (1)
INSERT INTO "SiteSetting" ("id", "siteName", "tagline", "emblemUrl", "primaryColor", "defaultSeoTitle", "defaultSeoDesc", "defaultOgImageUrl", "socialLinks", "footerText", "icpNumber", "resumeUrl", "rssMode", "createdAt", "updatedAt") VALUES ('singleton', '冒险者档案', '一本持续更新的冒险者手账', NULL, '#1F7F91', '冒险者档案 — 前端工程师的个人站', '前端工程师林澈的个人站：委托档案、技能树与手记。关注设计系统、性能与长期可维护的软件。', '/default-og.png', '[{"platform":"github","label":"GitHub","url":"https://github.com/"},{"platform":"email","label":"邮箱","url":"mailto:hi@example.com"},{"platform":"rss","label":"RSS","url":"/rss.xml"}]', '把复杂系统做得简单，把简单界面做得可靠。', NULL, NULL, 'SUMMARY', 1792476290406, 1792478480629);

-- Profile (1)
INSERT INTO "Profile" ("id", "avatarUrl", "displayName", "title", "className", "affiliation", "location", "headline", "bio", "yearsExperience", "email", "createdAt", "updatedAt") VALUES ('main', '/avatar.png', '林澈', '第七位阶 · 前端冒险者', '前端工程师', '独立开发者公会', '杭州', '把复杂系统做得简单，把简单界面做得可靠。', '我是林澈，一名前端工程师，目前以独立开发者身份接项目。

我的工作集中在三件事：**把设计落成可靠的前端实现**、**把长期没人敢动的模块拆开重写**、**给团队建立能持续执行的工程规范**。比起堆新框架，我更关心六个月后还有人愿意维护这份代码。

## 关注方向

- 设计系统与可访问性：让界面在键盘、读屏与小屏幕上同样可用
- 性能预算：把首屏体积当成产品约束，而不是上线前的补救项
- 内容与数据建模：先想清楚结构，再写页面

## 工作方式

1. 先对齐目标与验收口径，再讨论实现
2. 用最小可运行版本验证方向，再逐步补齐边界
3. 文档与代码同仓维护，决策记录比结论更重要

不接「先做出来再说」的长期项目；短期原型可以。', 6, 'hi@example.com', 1792476290413, 1792477146530);

-- TimelineEntry (4)
INSERT INTO "TimelineEntry" ("id", "period", "title", "organization", "description", "sortOrder", "createdAt", "updatedAt") VALUES ('cmvga3pf80001wsr0xcjjedtz', '2024 - 至今', '独立开发者', '自由职业', '为中小团队交付前端与全栈项目，维护两套长期产品。', 1, 1792476290421, 1792476290421);
INSERT INTO "TimelineEntry" ("id", "period", "title", "organization", "description", "sortOrder", "createdAt", "updatedAt") VALUES ('cmvga3pf80002wsr02d919zgu', '2022 - 2024', '高级前端工程师', '某 SaaS 公司', '负责数据产品前端架构，主导设计系统落地与性能治理。', 2, 1792476290421, 1792476290421);
INSERT INTO "TimelineEntry" ("id", "period", "title", "organization", "description", "sortOrder", "createdAt", "updatedAt") VALUES ('cmvga3pf80003wsr0rioz8aoy', '2020 - 2022', '前端工程师', '某互联网公司', '参与中后台与可视化项目，建立组件库与代码评审流程。', 3, 1792476290421, 1792476290421);
INSERT INTO "TimelineEntry" ("id", "period", "title", "organization", "description", "sortOrder", "createdAt", "updatedAt") VALUES ('cmvga3pf80004wsr0p2h1fuli', '2019 - 2020', '初级前端', '创业团队', '从 0 到 1 搭建管理后台，学会在小团队里做取舍。', 4, 1792476290421, 1792476290421);

-- SkillCategory (3)
INSERT INTO "SkillCategory" ("id", "name", "slug", "icon", "sortOrder", "createdAt", "updatedAt") VALUES ('cmvga3pfg0005wsr0ieztqicr', '前端工程', 'frontend', 'code', 1, 1792476290428, 1792476290428);
INSERT INTO "SkillCategory" ("id", "name", "slug", "icon", "sortOrder", "createdAt", "updatedAt") VALUES ('cmvga3pft000bwsr0cezd04pu', '工程化与架构', 'engineering', 'layers', 2, 1792476290442, 1792476290442);
INSERT INTO "SkillCategory" ("id", "name", "slug", "icon", "sortOrder", "createdAt", "updatedAt") VALUES ('cmvga3pg7000hwsr0v9cbnhww', '设计与协作', 'design', 'palette', 3, 1792476290455, 1792476290455);

-- Skill (16)
INSERT INTO "Skill" ("id", "categoryId", "name", "icon", "level", "years", "description", "learning", "sortOrder", "createdAt", "updatedAt") VALUES ('cmvga3pfn0006wsr0elmv2q06', 'cmvga3pfg0005wsr0ieztqicr', 'TypeScript', NULL, 5, 6, '类型建模、边界收敛与渐进式迁移。', 0, 1, 1792476290435, 1792476290435);
INSERT INTO "Skill" ("id", "categoryId", "name", "icon", "level", "years", "description", "learning", "sortOrder", "createdAt", "updatedAt") VALUES ('cmvga3pfn0007wsr0k86zrb2o', 'cmvga3pfg0005wsr0ieztqicr', 'React', NULL, 5, 6, 'RSC、状态管理与渲染性能取舍。', 0, 2, 1792476290435, 1792476290435);
INSERT INTO "Skill" ("id", "categoryId", "name", "icon", "level", "years", "description", "learning", "sortOrder", "createdAt", "updatedAt") VALUES ('cmvga3pfn0008wsr0qez5m3va', 'cmvga3pfg0005wsr0ieztqicr', 'Next.js', NULL, 4, 4, 'App Router、缓存策略与服务端动作。', 0, 3, 1792476290435, 1792476290435);
INSERT INTO "Skill" ("id", "categoryId", "name", "icon", "level", "years", "description", "learning", "sortOrder", "createdAt", "updatedAt") VALUES ('cmvga3pfn0009wsr02v38q98e', 'cmvga3pfg0005wsr0ieztqicr', 'CSS / 设计系统', NULL, 4, 5, '令牌体系、主题切换与响应式布局。', 0, 4, 1792476290435, 1792476290435);
INSERT INTO "Skill" ("id", "categoryId", "name", "icon", "level", "years", "description", "learning", "sortOrder", "createdAt", "updatedAt") VALUES ('cmvga3pfn000awsr0tho3aw4u', 'cmvga3pfg0005wsr0ieztqicr', '可访问性', NULL, 3, 3, '键盘路径、对比度与读屏语义。', 0, 5, 1792476290435, 1792476290435);
INSERT INTO "Skill" ("id", "categoryId", "name", "icon", "level", "years", "description", "learning", "sortOrder", "createdAt", "updatedAt") VALUES ('cmvga3pg0000cwsr05uh57wzv', 'cmvga3pft000bwsr0cezd04pu', 'Node.js', NULL, 4, 5, '服务端渲染、构建脚本与任务流水线。', 0, 1, 1792476290449, 1792476290449);
INSERT INTO "Skill" ("id", "categoryId", "name", "icon", "level", "years", "description", "learning", "sortOrder", "createdAt", "updatedAt") VALUES ('cmvga3pg0000dwsr0i3b8gbzf', 'cmvga3pft000bwsr0cezd04pu', 'Postgres / SQL', NULL, 4, 4, '索引设计、查询优化与数据建模。', 0, 2, 1792476290449, 1792476290449);
INSERT INTO "Skill" ("id", "categoryId", "name", "icon", "level", "years", "description", "learning", "sortOrder", "createdAt", "updatedAt") VALUES ('cmvga3pg0000ewsr0efzoutw8', 'cmvga3pft000bwsr0cezd04pu', 'Prisma', NULL, 3, 3, '迁移管理与类型安全查询。', 0, 3, 1792476290449, 1792476290449);
INSERT INTO "Skill" ("id", "categoryId", "name", "icon", "level", "years", "description", "learning", "sortOrder", "createdAt", "updatedAt") VALUES ('cmvga3pg0000fwsr0s5dypweu', 'cmvga3pft000bwsr0cezd04pu', '构建与 CI', NULL, 3, 4, '缓存、增量构建与质量门禁。', 0, 4, 1792476290449, 1792476290449);
INSERT INTO "Skill" ("id", "categoryId", "name", "icon", "level", "years", "description", "learning", "sortOrder", "createdAt", "updatedAt") VALUES ('cmvga3pg0000gwsr0z27avin5', 'cmvga3pft000bwsr0cezd04pu', '性能优化', NULL, 4, 3, 'LCP/CLS 预算、拆包与图片策略。', 0, 5, 1792476290449, 1792476290449);
INSERT INTO "Skill" ("id", "categoryId", "name", "icon", "level", "years", "description", "learning", "sortOrder", "createdAt", "updatedAt") VALUES ('cmvga3pgd000iwsr0vl4jha5b', 'cmvga3pg7000hwsr0v9cbnhww', 'Figma', NULL, 3, 4, '组件规范与设计交付协作。', 0, 1, 1792476290462, 1792476290462);
INSERT INTO "Skill" ("id", "categoryId", "name", "icon", "level", "years", "description", "learning", "sortOrder", "createdAt", "updatedAt") VALUES ('cmvga3pgd000jwsr0tqg8sbkb', 'cmvga3pg7000hwsr0v9cbnhww', '技术写作', NULL, 4, 3, '决策记录、接口文档与长文写作。', 0, 2, 1792476290462, 1792476290462);
INSERT INTO "Skill" ("id", "categoryId", "name", "icon", "level", "years", "description", "learning", "sortOrder", "createdAt", "updatedAt") VALUES ('cmvga3pgd000kwsr0qkjhvjyk', 'cmvga3pg7000hwsr0v9cbnhww', '需求拆解', NULL, 4, 5, '把模糊需求拆成可验收的迭代。', 0, 3, 1792476290462, 1792476290462);
INSERT INTO "Skill" ("id", "categoryId", "name", "icon", "level", "years", "description", "learning", "sortOrder", "createdAt", "updatedAt") VALUES ('cmvga3pgd000lwsr059j3vin2', 'cmvga3pg7000hwsr0v9cbnhww', '代码评审', NULL, 4, 4, '关注边界条件、可读性与回滚成本。', 0, 4, 1792476290462, 1792476290462);
INSERT INTO "Skill" ("id", "categoryId", "name", "icon", "level", "years", "description", "learning", "sortOrder", "createdAt", "updatedAt") VALUES ('cmvga3pgd000mwsr0u72bjar8', 'cmvga3pg7000hwsr0v9cbnhww', 'Rust', NULL, 1, 1, '正在补语言基础与所有权模型。', 1, 5, 1792476290462, 1792476290462);
INSERT INTO "Skill" ("id", "categoryId", "name", "icon", "level", "years", "description", "learning", "sortOrder", "createdAt", "updatedAt") VALUES ('cmvga3pgd000nwsr0pnz7zv2f', 'cmvga3pg7000hwsr0v9cbnhww', 'Three.js', NULL, 2, 1, '做小型可视化与交互原型。', 1, 6, 1792476290462, 1792476290462);

-- Project (4)
INSERT INTO "Project" ("id", "slug", "title", "summary", "content", "coverUrl", "role", "status", "featured", "sortOrder", "startDate", "endDate", "demoUrl", "repoUrl", "seoTitle", "seoDesc", "publishedAt", "createdAt", "updatedAt") VALUES ('cmvga3pit0010wsr0ealju433', 'star-map-console', '星图 · 数据可视化控制台', '面向运营团队的实时数据看板，把 12 个指标源收敛成 3 层视图。', '## 背景

运营团队每天早上要从 6 个后台导表，手工拼成一份「经营看板」。指标口径不一致、刷新靠人肉，导致同一个数字在不同会议上出现三个版本。

我负责把这条链路重做成一个统一的实时看板：一个数据源、一套口径、三类视图。

## 职责

- 独立完成信息架构、交互设计与前端实现
- 与数据团队确定 12 个核心指标的唯一定义
- 设计缓存与增量刷新策略，控制查询成本

## 方案

### 1. 指标层与视图层分离

指标定义集中在一份配置里，视图只声明「用哪些指标、怎么聚合」。新增指标不需要改组件：

```ts
type MetricDefinition = {
  key: string;
  label: string;
  unit: "count" | "ratio" | "currency";
  aggregation: "sum" | "avg" | "last";
};

export const metrics: MetricDefinition[] = [
  { key: "active_users", label: "活跃用户", unit: "count", aggregation: "last" },
  { key: "conversion", label: "转化率", unit: "ratio", aggregation: "avg" },
];
```

### 2. 首屏只取必要数据

首屏请求一屏所需的时间序列，详细维度在切换标签时按需加载。图表库按路由拆分，首屏不下载。

### 3. 空态与异常态优先设计

数据产品最常见的不是「没有数据」，而是「数据迟到了」。每个图表都带最后更新时间与数据延迟提示。

> [!NOTE]
> 看板不是报表的替代品。需要下钻与导出时，仍然跳回明细系统，避免把看板做成第二个 BI。

## 结果

- 日报准备时间从 40 分钟降到 0
- 指标口径统一为一份配置，新增指标平均 2 小时上线
- 首屏 LCP 从 4.1s 降到 1.8s（4G 模拟）', '/covers/project-1.png', '独立开发', 'COMPLETED', 1, 1, 1709251200000, 1732060800000, 'https://example.com/star-map', 'https://github.com/', NULL, NULL, 1732492800000, 1792476290549, 1792476290549);
INSERT INTO "Project" ("id", "slug", "title", "summary", "content", "coverUrl", "role", "status", "featured", "sortOrder", "startDate", "endDate", "demoUrl", "repoUrl", "seoTitle", "seoDesc", "publishedAt", "createdAt", "updatedAt") VALUES ('cmvga3pje0013wsr0pl937ura', 'expedition-reader', '远征 · 跨端阅读器', '离线优先的跨端阅读器，用一套内容模型同时支撑 Web、桌面与移动端。', '## 目标

我想要一个「关掉网络也能继续读」的跨端阅读器：网页、桌面与手机共享同一套书库与阅读进度。

## 现状与取舍

第一版试图三端各写一套，结果同步逻辑分叉，阅读进度经常互相覆盖。第二版改成**单一内容模型 + 端上薄客户端**：

- 书籍与文章统一为 `Document`，章节是它的有序子节点
- 阅读进度记录 `(documentId, position, updatedAt)`，冲突时以最后写入为准
- 离线队列只保存三种操作：进度、书签、笔记

## 正在进行

目前完成 Web 与桌面端，移动端只做了阅读器原型。下一步是解决大文件导入时的内存峰值：

```ts
for await (const chunk of stream) {
  await parser.write(chunk);
  if (parser.bufferSize > 4 * 1024 * 1024) {
    await parser.flush();
  }
}
```

## 学到的事

> [!TIP]
> 跨端同步的难点不是「同步」，而是「冲突时用户能理解发生了什么」。所有覆盖操作都需要可回溯。

- 内容与进度必须解耦，否则迁移一次格式就要重算全部进度
- 先把离线优先做对，再考虑实时协作', '/covers/project-2.png', '独立开发', 'IN_PROGRESS', 1, 2, 1749513600000, NULL, '', 'https://github.com/', NULL, NULL, 1754006400000, 1792476290570, 1792476290570);
INSERT INTO "Project" ("id", "slug", "title", "summary", "content", "coverUrl", "role", "status", "featured", "sortOrder", "startDate", "endDate", "demoUrl", "repoUrl", "seoTitle", "seoDesc", "publishedAt", "createdAt", "updatedAt") VALUES ('cmvga3pjy0015wsr009tum8he', 'scroll-pipeline', '卷轴 · Markdown 出版流水线', '把 Markdown 草稿一键发布为带目录、代码高亮与 RSS 的静态站点。', '## 背景

写作分散在三个地方：Markdown 文件、图床、发布脚本。每次发文章都要手工检查目录、图片与 RSS，出错概率高。

## 方案

一条从草稿到发布的流水线：

1. 监听内容目录，解析 Markdown AST
2. 生成标题锚点、目录与代码高亮
3. 输出静态 HTML、RSS、sitemap
4. 校验：死链、图片缺失、标题层级跳跃

```bash
pnpm build:content
# ✓ 42 posts
# ✓ 0 broken links
# ✓ rss.xml 32KB
```

## 关键决定

- 渲染在构建期完成，运行时零 Markdown 依赖
- 高亮器只在构建阶段加载，不进入客户端 bundle
- 校验失败直接中断构建，而不是输出警告

> [!WARNING]
> 自动摘要不能直接截断 Markdown 源码，否则会把代码块或链接截成半截。必须先转成纯文本再截断。

## 结果

单篇文章构建耗时 120ms，整站 6s；发布流程从 15 分钟缩短到一条命令。', '/covers/project-3.png', '设计与开发', 'COMPLETED', 1, 3, 1693526400000, 1707868800000, '', 'https://github.com/', NULL, NULL, 1708387200000, 1792476290591, 1792476290591);
INSERT INTO "Project" ("id", "slug", "title", "summary", "content", "coverUrl", "role", "status", "featured", "sortOrder", "startDate", "endDate", "demoUrl", "repoUrl", "seoTitle", "seoDesc", "publishedAt", "createdAt", "updatedAt") VALUES ('cmvga3pkd0016wsr0f6xt5d76', 'campfire-wiki', '篝火 · 团队知识库', '为 30 人团队搭建的内部知识库，检索响应从 8 秒降到 300 毫秒。', '## 背景

30 人的团队有 400 多篇文档散落在网盘、聊天记录与个人笔记里。搜索靠翻文件夹，新人平均两周才能找到需要的规范。

## 我做了什么

- 用统一模板收敛文档结构：目的、适用范围、决策记录、变更历史
- 搭建基于 Postgres 全文检索的站内搜索，中文分词使用 pg_jieba
- 增加「最近更新」与「被引用最多」两个入口，解决「不知道搜什么」的问题

## 检索优化

第一版用 `ILIKE ''%keyword%''`，数据量到 2 万段后查询 8 秒。改成 `tsvector` + GIN 索引后：

| 方案 | 平均响应 | 备注 |
| --- | --- | --- |
| ILIKE | 8.2s | 全表扫描 |
| tsvector + GIN | 0.3s | 需要中文分词 |
| 向量检索 | 1.4s | 语义召回更好，成本更高 |

## 结果

- 平均检索响应 300ms
- 新人上手时间从两周降到三天
- 文档陈旧率下降，因为「变更历史」让过期内容可见', '/covers/project-4.png', '全栈开发', 'COMPLETED', 0, 4, 1648771200000, 1669852800000, '', '', NULL, NULL, 1670630400000, 1792476290605, 1792476290605);

-- ProjectImage (3)
INSERT INTO "ProjectImage" ("id", "projectId", "url", "alt", "sortOrder", "createdAt") VALUES ('cmvga3pj00011wsr0gpnctyz8', 'cmvga3pit0010wsr0ealju433', '/covers/project-2.png', '指标总览页面', 1, 1792476290557);
INSERT INTO "ProjectImage" ("id", "projectId", "url", "alt", "sortOrder", "createdAt") VALUES ('cmvga3pj00012wsr0l04eqinb', 'cmvga3pit0010wsr0ealju433', '/covers/project-3.png', '趋势分析视图', 2, 1792476290557);
INSERT INTO "ProjectImage" ("id", "projectId", "url", "alt", "sortOrder", "createdAt") VALUES ('cmvga3pjl0014wsr05yonmdtf', 'cmvga3pje0013wsr0pl937ura', '/covers/project-4.png', '阅读界面原型', 1, 1792476290577);

-- Post (7)
INSERT INTO "Post" ("id", "slug", "title", "summary", "content", "coverUrl", "status", "pinned", "publishedAt", "seoTitle", "seoDesc", "viewCount", "createdAt", "updatedAt") VALUES ('cmvga3pkq0017wsr058xdtxe4', 'why-i-built-my-own-site-again', '为什么我又一次从零写了自己的站点', '模板站很快，但它不解释我是谁。第三次重写个人站之后，我把取舍写成了这份清单。', '## 第三次重写

第一次用现成主题，第二次用静态博客生成器。两次都很快，但都停在同一个问题上：我想改的往往不是文章，而是**结构和表达方式**。

模板能让我在半小时内上线，也会让我在半小时内放弃维护。

## 我真正需要的东西

- 内容存在数据库里，改一句简介不用重新构建
- 前台仍然静态优先，首屏不为后台功能付出体积
- 主题只出现在边缘：徽记、状态徽章、微文案，正文零装饰
- 后台只有我一个人用，所以它可以极其简单

这四条决定了技术选型：Next.js 的 App Router 负责「静态优先 + 局部动态」，Server Actions 负责写操作，Postgres 负责内容。

## 一个关键取舍

> [!NOTE]
> 个人站最贵的不是开发时间，而是三个月后你还愿不愿意打开它写一篇东西。

因此后台的发布路径必须短：写标题、写正文、按发布。没有工作流、没有审核、没有多角色。编辑器也故意保持朴素——Markdown 源码加实时预览，比任何富文本都更耐维护。

## 这一版的边界

不评论、不订阅、不多语言。所有「以后可能需要」的功能先不预留字段，等真正需要时再迁移。写下来是为了防止自己半夜加需求。

## 下一步

先把内容补齐，再用真实访问数据决定要不要做站内搜索。', NULL, 'PUBLISHED', 1, 1790906400000, NULL, NULL, 0, 1792476290619, 1792476290619);
INSERT INTO "Post" ("id", "slug", "title", "summary", "content", "coverUrl", "status", "pinned", "publishedAt", "seoTitle", "seoDesc", "viewCount", "createdAt", "updatedAt") VALUES ('cmvga3pl40018wsr0pv6x112k', 'single-person-cms-boundaries', '从零搭建内容管理：单人 CMS 的边界', '后台只有一位管理员时，哪些通用能力可以直接砍掉？一份关于「不做」的决策记录。', '## 单人 CMS 不是小型 CMS

通用 CMS 的复杂度主要来自权限与协作：角色、工作流、审批、通知。站点只有一位管理员时，这些全部可以删除，换来的是更短的发布路径和更少的界面。

## 我保留了什么

- **草稿与发布**：必须有，否则写一半的东西会污染线上
- **预览**：和前台使用同一条渲染管线，避免「预览正常、上线错版」
- **自动保存**：不是为了优雅，而是为了防止误关标签页
- **媒体库**：图片必须集中管理，否则正文里的链接迟早失效

## 我砍掉了什么

| 能力 | 决定 | 理由 |
| --- | --- | --- |
| 多角色权限 | 不做 | 只有一个人，越权场景不存在 |
| 审核流 | 不做 | 自己审自己没有意义 |
| 站内评论 | 不做 | 维护成本高，互动交给外部平台 |
| 多语言 | 不做 | 数据模型不预留字段，避免半成品 |
| 可视化页面搭建 | 不做 | 页面结构变化频率低，改代码更可控 |

## 安全仍然要认真

后台简单不等于可以省安全：

```ts
// 每个 Server Action 都独立校验会话，不只依赖 middleware
const session = await getSession();
if (!session) {
  return { ok: false, error: { code: "UNAUTHORIZED", message: "登录已过期" } };
}
```

登录失败要限流并锁定账号；上传要校验文件头而不是相信 `Content-Type`；Markdown 渲染必须经过白名单消毒。

> [!WARNING]
> 「只有我一个人用」是最危险的假设。暴露在公网的后台，攻击者不会因为你知道密码就放过它。', NULL, 'PUBLISHED', 1, 1789700400000, NULL, NULL, 0, 1792476290633, 1792476290633);
INSERT INTO "Post" ("id", "slug", "title", "summary", "content", "coverUrl", "status", "pinned", "publishedAt", "seoTitle", "seoDesc", "viewCount", "createdAt", "updatedAt") VALUES ('cmvga3pli0019wsr0w4abybau', 'rsc-after-three-months', 'React Server Components 上线三个月后的真实感受', '首屏更快了，但「哪里该用客户端组件」成了新的架构问题。记录几条踩过的坑。', '## 收益是真实的

把 Markdown 渲染、数据查询和 SEO 元信息放在服务端后，首屏 JS 从 210KB 降到 96KB（gzip）。列表页不再加载高亮器和编辑器依赖，这是最直接的变化。

## 坑一：状态边界比想象中更碎

一个「展开筛选」的按钮会把整棵子树变成客户端组件。解决方式不是把整页改成客户端，而是把交互下推到最小的叶子节点：

```tsx
// 服务端负责数据与结构
<ProjectFilters tags={tags} active={activeTag} />

// 客户端只负责抽屉开合
<FilterDrawer>{children}</FilterDrawer>
```

## 坑二：缓存标签会悄悄过期

标记了 `revalidate = 300` 的页面，在内容更新后最多可能看到 5 分钟的旧内容。写操作后必须显式刷新：

```ts
revalidatePath("/", "layout");
```

> [!NOTE]
> 缓存不是「设了就完事」的配置，而是一份需要和业务时延对齐的契约。发布后 10 秒可见，就要在每次发布时主动失效。

## 坑三：序列化边界

把 Date 对象传给客户端组件没问题，但把 Prisma 的完整记录传过去会把不必要的字段带进 RSC payload。列表查询坚持 `select` 明确字段，是这类项目的基本功。

## 现在还会这样选吗

会。RSC 让「默认不在客户端执行」成为起点，这比事后拆包更可靠。代价是团队需要理解边界，而这正好可以用类型和目录结构约束。', NULL, 'PUBLISHED', 0, 1786860000000, NULL, NULL, 0, 1792476290647, 1792476290647);
INSERT INTO "Post" ("id", "slug", "title", "summary", "content", "coverUrl", "status", "pinned", "publishedAt", "seoTitle", "seoDesc", "viewCount", "createdAt", "updatedAt") VALUES ('cmvga3plw001awsr0m9dp6wg2', 'design-tokens-in-css-variables', '把设计令牌落进 CSS 变量的几个决定', '为什么主色只存一个 brand，深色模式用 color-mix 派生？一份设计系统的实现笔记。', '## 令牌不是颜色表

设计令牌的价值在于**语义**：`--surface` 比 `#FFFBF2` 更稳定，因为后者在深色模式下没有意义。

我把令牌分成三层：

1. 基础色：纸、墨、金、青
2. 语义色：背景、表面、描边、正文、强调
3. 组件色：按钮、徽章、代码块

组件只使用第二层和第三层，绝不直接引用十六进制值。

## 主色只存一个变量

后台允许管理员修改主色。如果同时存浅色与深色两份，必然失同步。因此只存 `--brand`，深色模式派生：

```css
:root {
  --brand: #1f7f91;
  --primary: var(--brand);
}
html.dark {
  --primary: color-mix(in srgb, var(--brand) 45%, #ede6d8);
}
```

这样改一次主色，两套主题都会更新，且深色模式的可读性由混合比例保证。

## 对比度是约束，不是建议

`--text-muted` 在两种底色上都必须达到 4.5:1。达不到时调整明度，而不是把字号调大来「绕过」标准。

> [!WARNING]
> 主题色不能只靠肉眼挑。上线前用工具实测，尤其是按钮文字与标签底色。

## 少即是多

最终组件表只有 20 多个条目。每增加一个组件，都要问：它是否帮助访客更快理解内容？答案是否，就不加。', NULL, 'PUBLISHED', 0, 1783224000000, NULL, NULL, 0, 1792476290660, 1792476290660);
INSERT INTO "Post" ("id", "slug", "title", "summary", "content", "coverUrl", "status", "pinned", "publishedAt", "seoTitle", "seoDesc", "viewCount", "createdAt", "updatedAt") VALUES ('cmvga3pm9001bwsr09ru3mqli', 'database-choices-for-side-projects', '个人项目的数据库选型：先别急着上分布式', '从 SQLite 开始，需要时再迁移。关于连接池、备份与「够用」的判断。', '## 默认选择

个人项目的默认数据库应该是最容易备份、最容易本地启动的那个。对绝大多数站点，这是 SQLite；需要并发写与托管时，是单实例 Postgres。

「以后可能有一百万用户」不是选型理由。真到那一天，迁移数据库会是最小的问题。

## 我关注的四个指标

| 指标 | 说明 | 个人站阈值 |
| --- | --- | --- |
| 恢复时间 | 从备份回到可用状态 | < 30 分钟 |
| 迁移成本 | 换平台需要改多少代码 | 只改连接串 |
| 查询能力 | 是否支持需要的检索 | 全文检索可用 |
| 月成本 | 正常内容量 | 0 元 |

## 连接池的坑

Serverless 环境里每个实例都会建连接。用直连串很容易在高峰期打满数据库连接数：

```bash
# 应用使用池化连接
DATABASE_URL="postgresql://...?pgbouncer=true"
# 迁移使用直连
DIRECT_URL="postgresql://..."
```

> [!TIP]
> 迁移只在部署前执行一次，不需要池化；应用运行时才需要。把两条连接串分开配置，是最省事的做法。

## 备份要验证

没验证过的备份等于没有备份。每周导出一份，恢复到一个临时库，跑一次启动检查。这个习惯救过我一次。', NULL, 'PUBLISHED', 0, 1779433200000, NULL, NULL, 0, 1792476290674, 1792476290674);
INSERT INTO "Post" ("id", "slug", "title", "summary", "content", "coverUrl", "status", "pinned", "publishedAt", "seoTitle", "seoDesc", "viewCount", "createdAt", "updatedAt") VALUES ('cmvga3pmn001cwsr0jz0di2ro', 'reading-notes-maintainable-software', '阅读笔记：长期维护的软件长什么样', '重读几本关于软件设计的旧书，整理出三条能直接用在项目里的判断标准。', '## 三条判断标准

### 1. 改动的影响范围可预测

好的结构让「改一个字段」只影响一处。做不到时，通常不是代码风格问题，而是边界没有被定义。

### 2. 新人有地方开始

文档不是装饰。一个能跑起来的本地环境、一份目录说明、一条「从这里读起」的路径，比十页架构图有效。

### 3. 失败时能解释原因

错误信息要说明发生了什么、用户可以做什么。系统反馈不要用比喻：

- 反例：「魔力不足，传讯失败」
- 正例：「邮件发送失败，请稍后重试或直接发邮件到 hi@example.com」

> [!NOTE]
> 主题表达属于界面文案，不属于系统反馈。混淆这两者，用户会在最需要清晰信息的时候看到隐喻。

## 一个反直觉的结论

长期维护的项目往往**功能更少**。不是因为他们保守，而是因为每多一个功能，就多一条需要被理解、测试和回滚的路径。

删代码是最被低估的重构。', NULL, 'PUBLISHED', 0, 1773194400000, NULL, NULL, 0, 1792476290688, 1792476290688);
INSERT INTO "Post" ("id", "slug", "title", "summary", "content", "coverUrl", "status", "pinned", "publishedAt", "seoTitle", "seoDesc", "viewCount", "createdAt", "updatedAt") VALUES ('cmvga3pn1001dwsr0cdr3vtg4', 'markdown-after-five-years', '用 Markdown 写博客，五年后的取舍', '它依然是最稳的内容格式，但目录、图片与代码高亮都需要自己补课。', '## 为什么还在用

Markdown 是少数在五年后仍然可以直接打开、直接迁移、直接 diff 的格式。没有私有格式锁定，也没有编辑器依赖。

## 自己补的三块

### 目录

标题锚点必须在渲染时统一生成，且与目录使用同一套 slug 规则，否则点击会跳错位置。

### 图片

图片要懒加载、要有尺寸、要有 alt。没有尺寸就会布局偏移，没有 alt 就对读屏用户不可用。

### 代码

高亮在服务端完成，客户端只负责复制按钮：

```ts
button.textContent = "复制";
button.addEventListener("click", async () => {
  await navigator.clipboard.writeText(pre.innerText);
});
```

## 会放弃的

花哨的嵌入语法。每引入一种自定义语法，就多一个渲染分支、多一处可能出错的地方。

> [!TIP]
> 写作者只需要记住六种语法：标题、列表、链接、图片、引用、代码块。其余都是编辑器的工作。', NULL, 'PUBLISHED', 0, 1765256400000, NULL, NULL, 0, 1792476290701, 1792476290701);

-- Tag (12)
INSERT INTO "Tag" ("id", "name", "slug", "createdAt") VALUES ('cmvga3pgk000owsr0nn2ndxp3', 'TypeScript', 'typescript', 1792476290468);
INSERT INTO "Tag" ("id", "name", "slug", "createdAt") VALUES ('cmvga3pgq000pwsr0tho3oncr', 'React', 'react', 1792476290475);
INSERT INTO "Tag" ("id", "name", "slug", "createdAt") VALUES ('cmvga3pgx000qwsr0th99151s', 'Next.js', 'nextjs', 1792476290482);
INSERT INTO "Tag" ("id", "name", "slug", "createdAt") VALUES ('cmvga3ph4000rwsr0qiz9oryr', '工程实践', 'engineering', 1792476290488);
INSERT INTO "Tag" ("id", "name", "slug", "createdAt") VALUES ('cmvga3pha000swsr0vxhaggj2', '设计', 'design', 1792476290495);
INSERT INTO "Tag" ("id", "name", "slug", "createdAt") VALUES ('cmvga3phh000twsr0l1zqgcpp', '性能', 'performance', 1792476290501);
INSERT INTO "Tag" ("id", "name", "slug", "createdAt") VALUES ('cmvga3pho000uwsr00s5zbs2v', '数据库', 'database', 1792476290508);
INSERT INTO "Tag" ("id", "name", "slug", "createdAt") VALUES ('cmvga3phu000vwsr0c01w2un7', '阅读', 'reading', 1792476290515);
INSERT INTO "Tag" ("id", "name", "slug", "createdAt") VALUES ('cmvga3pi1000wwsr0k5heis9l', '写作', 'writing', 1792476290521);
INSERT INTO "Tag" ("id", "name", "slug", "createdAt") VALUES ('cmvga3pi7000xwsr0yxfzbmwx', 'Markdown', 'markdown', 1792476290528);
INSERT INTO "Tag" ("id", "name", "slug", "createdAt") VALUES ('cmvga3pie000ywsr03pwd5cnx', 'CSS', 'css', 1792476290534);
INSERT INTO "Tag" ("id", "name", "slug", "createdAt") VALUES ('cmvga3pik000zwsr0ycymekha', '可视化', 'visualization', 1792476290541);

-- PostTag (17)
INSERT INTO "PostTag" ("postId", "tagId") VALUES ('cmvga3pkq0017wsr058xdtxe4', 'cmvga3ph4000rwsr0qiz9oryr');
INSERT INTO "PostTag" ("postId", "tagId") VALUES ('cmvga3pkq0017wsr058xdtxe4', 'cmvga3pgx000qwsr0th99151s');
INSERT INTO "PostTag" ("postId", "tagId") VALUES ('cmvga3pkq0017wsr058xdtxe4', 'cmvga3pha000swsr0vxhaggj2');
INSERT INTO "PostTag" ("postId", "tagId") VALUES ('cmvga3pl40018wsr0pv6x112k', 'cmvga3ph4000rwsr0qiz9oryr');
INSERT INTO "PostTag" ("postId", "tagId") VALUES ('cmvga3pl40018wsr0pv6x112k', 'cmvga3pgx000qwsr0th99151s');
INSERT INTO "PostTag" ("postId", "tagId") VALUES ('cmvga3pli0019wsr0w4abybau', 'cmvga3pgq000pwsr0tho3oncr');
INSERT INTO "PostTag" ("postId", "tagId") VALUES ('cmvga3pli0019wsr0w4abybau', 'cmvga3pgx000qwsr0th99151s');
INSERT INTO "PostTag" ("postId", "tagId") VALUES ('cmvga3pli0019wsr0w4abybau', 'cmvga3phh000twsr0l1zqgcpp');
INSERT INTO "PostTag" ("postId", "tagId") VALUES ('cmvga3plw001awsr0m9dp6wg2', 'cmvga3pha000swsr0vxhaggj2');
INSERT INTO "PostTag" ("postId", "tagId") VALUES ('cmvga3plw001awsr0m9dp6wg2', 'cmvga3pie000ywsr03pwd5cnx');
INSERT INTO "PostTag" ("postId", "tagId") VALUES ('cmvga3pm9001bwsr09ru3mqli', 'cmvga3pho000uwsr00s5zbs2v');
INSERT INTO "PostTag" ("postId", "tagId") VALUES ('cmvga3pm9001bwsr09ru3mqli', 'cmvga3ph4000rwsr0qiz9oryr');
INSERT INTO "PostTag" ("postId", "tagId") VALUES ('cmvga3pmn001cwsr0jz0di2ro', 'cmvga3phu000vwsr0c01w2un7');
INSERT INTO "PostTag" ("postId", "tagId") VALUES ('cmvga3pmn001cwsr0jz0di2ro', 'cmvga3ph4000rwsr0qiz9oryr');
INSERT INTO "PostTag" ("postId", "tagId") VALUES ('cmvga3pmn001cwsr0jz0di2ro', 'cmvga3pi1000wwsr0k5heis9l');
INSERT INTO "PostTag" ("postId", "tagId") VALUES ('cmvga3pn1001dwsr0cdr3vtg4', 'cmvga3pi7000xwsr0yxfzbmwx');
INSERT INTO "PostTag" ("postId", "tagId") VALUES ('cmvga3pn1001dwsr0cdr3vtg4', 'cmvga3pi1000wwsr0k5heis9l');

-- ProjectTag (12)
INSERT INTO "ProjectTag" ("projectId", "tagId") VALUES ('cmvga3pit0010wsr0ealju433', 'cmvga3pgq000pwsr0tho3oncr');
INSERT INTO "ProjectTag" ("projectId", "tagId") VALUES ('cmvga3pit0010wsr0ealju433', 'cmvga3pgk000owsr0nn2ndxp3');
INSERT INTO "ProjectTag" ("projectId", "tagId") VALUES ('cmvga3pit0010wsr0ealju433', 'cmvga3pik000zwsr0ycymekha');
INSERT INTO "ProjectTag" ("projectId", "tagId") VALUES ('cmvga3pje0013wsr0pl937ura', 'cmvga3pgx000qwsr0th99151s');
INSERT INTO "ProjectTag" ("projectId", "tagId") VALUES ('cmvga3pje0013wsr0pl937ura', 'cmvga3pho000uwsr00s5zbs2v');
INSERT INTO "ProjectTag" ("projectId", "tagId") VALUES ('cmvga3pje0013wsr0pl937ura', 'cmvga3phh000twsr0l1zqgcpp');
INSERT INTO "ProjectTag" ("projectId", "tagId") VALUES ('cmvga3pjy0015wsr009tum8he', 'cmvga3pi7000xwsr0yxfzbmwx');
INSERT INTO "ProjectTag" ("projectId", "tagId") VALUES ('cmvga3pjy0015wsr009tum8he', 'cmvga3ph4000rwsr0qiz9oryr');
INSERT INTO "ProjectTag" ("projectId", "tagId") VALUES ('cmvga3pjy0015wsr009tum8he', 'cmvga3pi1000wwsr0k5heis9l');
INSERT INTO "ProjectTag" ("projectId", "tagId") VALUES ('cmvga3pkd0016wsr0f6xt5d76', 'cmvga3pho000uwsr00s5zbs2v');
INSERT INTO "ProjectTag" ("projectId", "tagId") VALUES ('cmvga3pkd0016wsr0f6xt5d76', 'cmvga3ph4000rwsr0qiz9oryr');
INSERT INTO "ProjectTag" ("projectId", "tagId") VALUES ('cmvga3pkd0016wsr0f6xt5d76', 'cmvga3phh000twsr0l1zqgcpp');

-- Media (6)
INSERT INTO "Media" ("id", "key", "url", "filename", "mimeType", "size", "width", "height", "createdAt") VALUES ('cmvga3pnf001ewsr09sursetl', 'covers/project-1.png', '/covers/project-1.png', 'project-1.png', 'image/png', 144699, 1200, 675, 1792476290715);
INSERT INTO "Media" ("id", "key", "url", "filename", "mimeType", "size", "width", "height", "createdAt") VALUES ('cmvga3pnm001fwsr0p4re56h2', 'covers/project-2.png', '/covers/project-2.png', 'project-2.png', 'image/png', 98522, 1200, 675, 1792476290722);
INSERT INTO "Media" ("id", "key", "url", "filename", "mimeType", "size", "width", "height", "createdAt") VALUES ('cmvga3pns001gwsr03l4u8jwd', 'covers/project-3.png', '/covers/project-3.png', 'project-3.png', 'image/png', 118791, 1200, 675, 1792476290729);
INSERT INTO "Media" ("id", "key", "url", "filename", "mimeType", "size", "width", "height", "createdAt") VALUES ('cmvga3pnz001hwsr02r8x2306', 'covers/project-4.png', '/covers/project-4.png', 'project-4.png', 'image/png', 89023, 1200, 675, 1792476290736);
INSERT INTO "Media" ("id", "key", "url", "filename", "mimeType", "size", "width", "height", "createdAt") VALUES ('cmvga3po6001iwsr0usyidjyh', 'default-og.png', '/default-og.png', 'default-og.png', 'image/png', 169707, 1200, 630, 1792476290743);
INSERT INTO "Media" ("id", "key", "url", "filename", "mimeType", "size", "width", "height", "createdAt") VALUES ('cmvga3pod001jwsr0kjn8dpyr', 'avatar.png', '/avatar.png', 'avatar.png', 'image/png', 63979, 800, 800, 1792476290749);

