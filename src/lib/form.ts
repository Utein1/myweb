export function str(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

export function bool(form: FormData, key: string) {
  const value = form.get(key);
  return value === "on" || value === "true" || value === "1";
}

export function num(form: FormData, key: string, fallback = 0) {
  const value = Number(str(form, key));
  return Number.isFinite(value) ? value : fallback;
}

export function json<T>(form: FormData, key: string, fallback: T): T {
  const value = form.get(key);
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function list(form: FormData, key: string) {
  return str(form, key)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** 把 FormData 转成普通对象，供 zod 校验 */
export function formValues(form: FormData, overrides: Record<string, unknown> = {}) {
  const values: Record<string, unknown> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") values[key] = value;
  }
  return { ...values, ...overrides };
}

export function parseListJson<T>(value: string, fallback: T[]): T[] {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}
