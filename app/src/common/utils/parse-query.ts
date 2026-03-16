/**
 * 安全解析分页参数，避免 NaN 或非法值导致查询异常。
 * limit/page_size：正整数，默认 20，上限 100。
 * offset：非负整数，默认 0。
 * page：正整数，默认 1。
 */
export function parseLimit(value: string | undefined, defaultVal = 20): number {
  const n = value ? parseInt(value, 10) : defaultVal;
  return Number.isFinite(n) && n > 0 ? Math.min(n, 100) : defaultVal;
}

export function parseOffset(value: string | undefined, defaultVal = 0): number {
  const n = value ? parseInt(value, 10) : defaultVal;
  return Number.isFinite(n) && n >= 0 ? n : defaultVal;
}

export function parsePage(value: string | undefined, defaultVal = 1): number {
  const n = value ? parseInt(value, 10) : defaultVal;
  return Number.isFinite(n) && n >= 1 ? n : defaultVal;
}

/** 解析可选正整数（如 game_id、department_id），非法或空则返回 undefined，避免向 Service 传 NaN */
export function parseOptionalInt(value: string | undefined): number | undefined {
  if (value == null || value === '') return undefined;
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n >= 1 ? n : undefined;
}
