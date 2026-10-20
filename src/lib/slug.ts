const SLUG_PATTERN = /^[a-z0-9-]+$/;

export function isValidSlug(slug: string) {
  return SLUG_PATTERN.test(slug);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** 中文标题无法转写时，用日期 + 短随机串兜底 */
export function fallbackSlug(prefix = "entry") {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${stamp}-${rand}`;
}

export function ensureSlug(input: string, prefix = "entry") {
  const slug = slugify(input);
  return slug || fallbackSlug(prefix);
}

export async function uniqueSlug(
  desired: string,
  exists: (slug: string) => Promise<boolean>,
  prefix = "entry",
) {
  const base = ensureSlug(desired, prefix);
  let candidate = base;
  let index = 2;
  // 最多尝试 50 次，避免无限循环
  while (await exists(candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
    if (index > 50) return fallbackSlug(prefix);
  }
  return candidate;
}
