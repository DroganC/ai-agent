/**
 * 连连看 - 游戏状态（开始页 / 进行中 / 结束页）
 */
import { makeAutoObservable } from 'mobx';
import { TYPES, PAIRS_PER_TYPE } from './types';
import type { SelectCellResult, HintPair } from './types';
import { computeGridSize, canConnect } from './utils';

/** 游戏界面：开始 | 进行中 | 结束 */
export type GameScreen = 'start' | 'play' | 'end';

/** 当前选中的格子坐标 */
export interface SelectedCell {
  r: number;
  c: number;
}

export const gameStore = makeAutoObservable({
  screen: 'start' as GameScreen,
  /** 网格数据：-1 表示已消除 */
  grid: [] as number[][],
  rows: 6,
  cols: 8,
  selected: null as SelectedCell | null,
  pairsDone: 0,
  totalPairs: TYPES.length * PAIRS_PER_TYPE,

  get pairsTotal(): number {
    return this.totalPairs;
  },

  initGrid(): void {
    const { cols, rows } = computeGridSize();
    this.rows = rows;
    this.cols = cols;
    const flat: number[] = [];
    for (let t = 0; t < TYPES.length; t++) {
      for (let i = 0; i < PAIRS_PER_TYPE; i++) {
        flat.push(t, t);
      }
    }
    for (let i = flat.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flat[i], flat[j]] = [flat[j]!, flat[i]!];
    }
    this.grid = [];
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < cols; c++) {
        this.grid[r]![c] = flat[idx++]!;
      }
    }
    this.pairsDone = 0;
    this.selected = null;
    this.screen = 'play';
  },

  selectCell(r: number, c: number): SelectCellResult {
    if (this.grid[r]?.[c] === undefined || this.grid[r]![c]! === -1) {
      return { connected: false };
    }
    if (this.selected) {
      const { r: r0, c: c0 } = this.selected;
      if (r0 === r && c0 === c) {
        this.selected = null;
        return { connected: false };
      }
      const connected = canConnect(
        this.grid,
        this.rows,
        this.cols,
        r0,
        c0,
        r,
        c
      );
      if (connected) {
        const typeId = this.grid[r]![c]!;
        this.selected = null;
        return { connected: true, typeId, r1: r0, c1: c0, r2: r, c2: c };
      }
      this.selected = { r, c };
      return { connected: false };
    }
    this.selected = { r, c };
    return { connected: false };
  },

  commitClear(r1: number, c1: number, r2: number, c2: number): void {
    if (
      r1 < 0 || r1 >= this.rows || c1 < 0 || c1 >= this.cols ||
      r2 < 0 || r2 >= this.rows || c2 < 0 || c2 >= this.cols
    ) return;
    this.grid[r1]![c1]! = -1;
    this.grid[r2]![c2]! = -1;
    this.pairsDone++;
    if (this.pairsDone >= this.totalPairs) this.screen = 'end';
  },

  hasSolution(): boolean {
    return this.findHint() !== null;
  },

  findHint(): HintPair | null {
    for (let r1 = 0; r1 < this.rows; r1++) {
      for (let c1 = 0; c1 < this.cols; c1++) {
        if (this.grid[r1]![c1]! === -1) continue;
        for (let r2 = 0; r2 < this.rows; r2++) {
          for (let c2 = 0; c2 < this.cols; c2++) {
            if (
              (r1 === r2 && c1 === c2) ||
              this.grid[r2]![c2]! === -1
            )
              continue;
            if (
              canConnect(
                this.grid,
                this.rows,
                this.cols,
                r1,
                c1,
                r2,
                c2
              )
            ) {
              return { r1, c1, r2, c2 };
            }
          }
        }
      }
    }
    return null;
  },

  shuffle(): void {
    this.selected = null;
    const flat: number[] = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r]![c]! !== -1) flat.push(this.grid[r]![c]!);
      }
    }
    for (let i = flat.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flat[i], flat[j]] = [flat[j]!, flat[i]!];
    }
    let idx = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r]![c]! !== -1) this.grid[r]![c]! = flat[idx++]!;
      }
    }
  },

  startGame(): void {
    this.initGrid();
  },

  restart(): void {
    this.screen = 'start';
  },
});
