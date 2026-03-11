import { makeAutoObservable, runInAction } from 'mobx';
import { fetchOrders } from '../services/store';
import { getErrorMessage } from '../utils/error';
import type { StoreOrder } from '../types/api';

/**
 * 兑换记录页状态
 * 管理订单列表及加载/错误状态
 */
export class StoreOrdersStore {
  /** 订单列表 */
  orders: StoreOrder[] = [];
  /** 是否正在加载 */
  loading = true;
  /** 错误信息，null 表示无错误 */
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /** 拉取兑换记录 */
  async load(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const list = await fetchOrders();
      runInAction(() => {
        this.orders = list;
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
