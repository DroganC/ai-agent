import type { DifferenceRect } from './types';

/** 容差：区域向外扩展的比例，仍算命中 */
const HIT_TOLERANCE = 0.05;

/**
 * 点击坐标 (px) 转为相对图片的比例 (x, y)，范围 [0, 1]
 * 若 rect 宽高为 0 则返回 (0, 0)，避免 NaN/Infinity
 */
export function clientToRatio(
  clientX: number,
  clientY: number,
  rect: DOMRect
): { x: number; y: number } {
  const w = rect.width || 1;
  const h = rect.height || 1;
  const x = (clientX - rect.left) / w;
  const y = (clientY - rect.top) / h;
  return { x, y };
}

/**
 * 判断比例点 (x, y) 是否落在区域 r 内（可加容差）
 */
export function isPointInRect(
  x: number,
  y: number,
  r: DifferenceRect,
  tolerance: number = HIT_TOLERANCE
): boolean {
  const minX = Math.max(0, r.x - tolerance);
  const maxX = Math.min(1, r.x + r.w + tolerance);
  const minY = Math.max(0, r.y - tolerance);
  const maxY = Math.min(1, r.y + r.h + tolerance);
  return x >= minX && x <= maxX && y >= minY && y <= maxY;
}
