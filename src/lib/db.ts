import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Workers 里没有全局可复用的数据库连接：D1 绑定由平台注入，
 * 只能在请求上下文里通过 getCloudflareContext 拿到。
 *
 * 同时 Next.js 构建期预渲染（ISR/SSG）使用 worker 线程，拿不到同步上下文，
 * 因此这里用异步方式初始化，并用 Proxy 让查询在调用时才真正建连。
 */
let clientPromise: Promise<PrismaClient> | null = null;

async function getClient(): Promise<PrismaClient> {
  if (!clientPromise) {
    clientPromise = (async () => {
      const { env } = await getCloudflareContext({ async: true });
      const db = env.DB;
      if (!db) {
        throw new Error("缺少 D1 绑定 DB，请检查 wrangler.jsonc");
      }
      return new PrismaClient({ adapter: new PrismaD1(db) });
    })().catch((error) => {
      clientPromise = null;
      throw error;
    });
  }
  return clientPromise;
}

const modelProxies = new Map<string, unknown>();

function modelProxy(model: string) {
  const cached = modelProxies.get(model);
  if (cached) return cached;

  const proxy = new Proxy(
    {},
    {
      get(_target, method) {
        if (typeof method !== "string") return undefined;
        return async (...args: unknown[]) => {
          const client = await getClient();
          const delegate = (client as unknown as Record<string, Record<string, unknown>>)[model];
          const fn = delegate?.[method];
          if (typeof fn !== "function") {
            throw new Error(`Prisma: ${model}.${method} 不存在`);
          }
          return fn.apply(delegate, args);
        };
      },
    },
  );

  modelProxies.set(model, proxy);
  return proxy;
}

/**
 * 与 PrismaClient 同形：`prisma.post.findMany(...)`、`prisma.$queryRaw(...)` 都可用。
 * 注意：D1 不支持事务，请避免使用交互式 $transaction。
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    if (typeof property !== "string") return undefined;
    if (property.startsWith("$")) {
      return async (...args: unknown[]) => {
        const client = await getClient();
        const fn = (client as unknown as Record<string, unknown>)[property];
        if (typeof fn !== "function") {
          throw new Error(`Prisma: ${property} 不存在`);
        }
        return fn.apply(client, args);
      };
    }
    return modelProxy(property);
  },
}) as PrismaClient;
