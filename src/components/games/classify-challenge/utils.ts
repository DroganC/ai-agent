import type { ClassifyQuestion, ClassifyRunSummary } from './types';

export function shuffle<T>(arr: readonly T[], seed?: number): T[] {
  // 轻量洗牌：首版足够；如需可复现，可把 seed 接入更稳定的 PRNG
  const out = [...arr];
  let s = seed ?? Date.now();
  const rand = (): number => {
    // xorshift32
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export function calcScore(args: {
  correct: number;
  errors: number;
  keyErrors: number;
  durationMs: number;
}): number {
  const base = args.correct * 10;
  const penalty = args.errors * 5 + args.keyErrors * 20;
  const elapsedSeconds = Math.floor(args.durationMs / 1000);
  const timeBonus = Math.max(0, 30 - Math.floor(elapsedSeconds / 5));
  return Math.max(0, base - penalty + timeBonus);
}

export function makeSummary(params: {
  levelId: string;
  total: number;
  correct: number;
  errors: number;
  keyErrors: number;
  durationMs: number;
  status: ClassifyRunSummary['status'];
  failReason?: ClassifyRunSummary['failReason'];
}): ClassifyRunSummary {
  return {
    levelId: params.levelId,
    total: params.total,
    correct: params.correct,
    errors: params.errors,
    keyErrors: params.keyErrors,
    durationMs: params.durationMs,
    score: calcScore({
      correct: params.correct,
      errors: params.errors,
      keyErrors: params.keyErrors,
      durationMs: params.durationMs,
    }),
    status: params.status,
    failReason: params.failReason,
  };
}

export function formatQuestionShort(q: ClassifyQuestion): string {
  return q.subtitle ? `${q.title}（${q.subtitle}）` : q.title;
}

