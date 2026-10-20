import "server-only";
import { createHash } from "node:crypto";

/** 对 IP 等敏感字段做加盐哈希，只在服务端使用 */
export function sha256(text: string) {
  return createHash("sha256")
    .update(text + (process.env.AUTH_SECRET ?? "salt"))
    .digest("hex");
}
