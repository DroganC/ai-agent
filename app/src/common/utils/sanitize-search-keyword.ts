/**
 * 名称/标题模糊查询用关键字处理：去首尾空格、限制长度，避免长 LIKE 与滥用。
 * 空串或仅空格返回 undefined，调用方不传该条件即可。
 * @param value 原始查询关键字（如 URL query 传入）
 * @param maxLen 最大保留长度，默认 64，与多数 name/title 字段长度一致
 * @returns 可用于 LIKE 的字符串，或 undefined 表示不参与筛选
 */
export function sanitizeSearchKeyword(
  value: string | undefined,
  maxLen = 64,
): string | undefined {
  if (value == null) return undefined;
  const trimmed = String(value).trim();
  if (trimmed === '') return undefined;
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen) : trimmed;
}

/**
 * 将关键字转义后用于 SQL LIKE，避免用户输入 % _ 改变匹配语义（如 % 匹配任意）。
 * 与 sanitizeSearchKeyword 配合：先 sanitize 再 escape，再拼成 LIKE '%...%'。
 */
export function escapeLikePattern(keyword: string): string {
  return keyword.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}
