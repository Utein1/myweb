const DATE_FORMAT = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Shanghai",
});

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Shanghai",
});

const MONTH_FORMAT = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  timeZone: "Asia/Shanghai",
});

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "";
  return DATE_FORMAT.format(new Date(date));
}

/** 列表用短日期：2026.10.20 */
export function formatDateShort(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = new Date(date);
  const parts = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}.${get("month")}.${get("day")}`;
}

export function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return "";
  return DATE_TIME_FORMAT.format(new Date(date));
}

export function formatMonth(date: Date | string) {
  return MONTH_FORMAT.format(new Date(date));
}

export function formatMonthKey(date: Date | string) {
  const d = new Date(date);
  const parts = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    timeZone: "Asia/Shanghai",
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}`;
}

export function formatYear(date: Date | string | null | undefined) {
  if (!date) return "";
  return new Intl.DateTimeFormat("zh-CN", { year: "numeric", timeZone: "Asia/Shanghai" }).format(
    new Date(date),
  );
}

/** 用于 <input type="date">，按 Asia/Shanghai 输出 yyyy-MM-dd */
export function toDateInputValue(date: Date | string | null | undefined) {
  if (!date) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  }).formatToParts(new Date(date));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** 用于 <input type="datetime-local">，按 Asia/Shanghai 输出 yyyy-MM-ddTHH:mm */
export function toDateTimeInputValue(date: Date | string | null | undefined) {
  if (!date) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  }).formatToParts(new Date(date));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function parseDateInput(value: FormDataEntryValue | null | undefined) {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = new Date(`${value.trim()}T00:00:00+08:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
