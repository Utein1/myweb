/**
 * Webpack loader：把 Prisma Query Compiler 的 .wasm 编译成 WebAssembly.Module。
 *
 * Prisma 的 workerd 运行时这样加载编译器：
 *   const { default: module } = await import("./query_compiler_fast_bg.wasm?module")
 * 这个 `?module` 约定由 wrangler/esbuild 提供，Next.js 的 webpack 不认识，
 * 所以在构建期把二进制内联成 base64。
 *
 * 注意：Workers 禁止同步编译 wasm（new WebAssembly.Module 会报
 * "Wasm code generation disallowed by embedder"），因此导出 WebAssembly.compile()
 * 返回的 Promise——Prisma 的加载函数是 async 的，await 时会自动解包成 Module。
 */
module.exports = function prismaWasmModuleLoader(source) {
  const base64 = Buffer.from(source).toString("base64");
  return [
    `const bytes = Uint8Array.from(atob("${base64}"), (char) => char.charCodeAt(0));`,
    `export default WebAssembly.compile(bytes);`,
  ].join("\n");
};

module.exports.raw = true;
