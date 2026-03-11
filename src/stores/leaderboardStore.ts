import { makeAutoObservable, runInAction } from 'mobx';
import { fetchLeaderboard } from '../services/leaderboard';
import { getErrorMessage } from '../utils/error';
import type { LeaderboardItem } from '../types/api';

/** 排行榜展示范围：全部 | 本部门 */
export type LeaderboardScope = 'all' | 'dept';

/**
 * 排行榜页状态
 * 管理榜单数据、更新时间、展示范围（全部/本部门）及加载/错误状态
 */
export class LeaderboardStore {
  /** 原始榜单列表（全部） */
  items: LeaderboardItem[] = [];
  /** 数据更新时间文案 */
  updatedAt = '';
  /** 是否正在加载 */
  loading = true;
  /** 错误信息，null 表示无错误 */
  error: string | null = null;
  /** 展示范围：全部 或 本部门 */
  scope: LeaderboardScope = 'all';

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * 根据当前 scope 与用户部门名返回过滤后的列表（本部门时按部门名过滤）
   * @param myDepartmentName 当前用户部门名，用于本部门筛选
   */
  getViewData(myDepartmentName: string | undefined): LeaderboardItem[] {
    if (this.scope === 'dept' && myDepartmentName) {
      return this.items.filter((x) => x.department_name === myDepartmentName);
    }
    return this.items;
  }

  /** 拉取排行榜数据 */
  async load(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const resp = await fetchLeaderboard();
      runInAction(() => {
        this.items = resp.items;
        this.updatedAt = resp.updatedAt;
      });
    } catch (e: unknown) {
      runInAction(() => {
        this.error = getErrorMessage(e, '加载失败');
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  /** 切换展示范围 */
  setScope(scope: LeaderboardScope): void {
    this.scope = scope;
  }

  /** 重置错误 */
  clearError(): void {
    this.error = null;
  }
}
