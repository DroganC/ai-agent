import { makeAutoObservable, runInAction } from 'mobx';
import { fetchPointTransactions } from '../services/user';
import { fetchLife } from '../services/life';
import { getErrorMessage } from '../utils/error';
import type { PointTransaction } from '../types/api';

/**
 * 个人主页状态
 * 管理积分流水、生命值及加载/错误状态
 */
export class ProfileStore {
  /** 积分变动流水 */
  pointFlows: PointTransaction[] = [];
  /** 当前生命值 */
  life = 0;
  /** 是否正在加载 */
  loading = true;
  /** 错误信息，null 表示无错误 */
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /** 加载积分流水与生命值 */
  async load(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const [flowsRes, lifeRes] = await Promise.all([fetchPointTransactions(), fetchLife()]);
      runInAction(() => {
        this.pointFlows = flowsRes;
        this.life = lifeRes.life_count;
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

  /** 重置错误 */
  clearError(): void {
    this.error = null;
  }
}
