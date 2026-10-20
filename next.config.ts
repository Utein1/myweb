import type { NextConfig } from "next";
import path from "node:path";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// 本地 `next dev` 时启用 wrangler 的本地绑定（D1 / R2），与线上行为保持一致
initOpenNextCloudflareForDev();

const storageHost = process.env.NEXT_PUBLIC_STORAGE_HOST;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Cloudflare Workers 上没有 sharp，图片优化交给浏览器/未来的 Cloudflare Images
    unoptimized: true,
    remotePatterns: storageHost
      ? [{ protocol: "https", hostname: storageHost }]
      : [],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  webpack: (config) => {
    // Prisma 7 的查询编译器以 .wasm?module 形式导入，webpack 默认不识别；
    // 用自定义 loader 内联为 WebAssembly.Module（见 scripts/wasm-module-loader.cjs）。
    config.module.rules.push({
      test: /\.wasm$/,
      resourceQuery: /module/,
      type: "javascript/auto",
      use: [{ loader: path.join(process.cwd(), "scripts/wasm-module-loader.cjs") }],
    });
    return config;
  },
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
