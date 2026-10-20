const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\u3040-\u30ff]/g;

/** 中文字符 350 字/分钟、英文单词 200 词/分钟，最小 1 分钟 */
export function readingTime(markdown: string) {
  const withoutCode = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ");
  const cjkCount = (withoutCode.match(CJK) ?? []).length;
  const latinWords = (withoutCode.replace(CJK, " ").match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) ?? [])
    .length;
  const minutes = cjkCount / 350 + latinWords / 200;
  return Math.max(1, Math.round(minutes));
}

export function readingTimeLabel(markdown: string) {
  return `本篇约 ${readingTime(markdown)} 分钟读完`;
}
