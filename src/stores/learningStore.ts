import { makeAutoObservable, runInAction } from 'mobx';
import { fetchCategories, fetchMaterials } from '../services/learning';
import { getErrorMessage } from '../utils/error';
import type { LearningCategory, LearningMaterial } from '../types/api';

/**
 * 学习中心页状态
 * 管理分类列表、学习材料列表、当前选中的分类及加载/错误状态
 */
export class LearningStore {
  /** 分类列表 */
  categories: LearningCategory[] = [];
  /** 学习材料列表（可按分类筛选） */
  materials: LearningMaterial[] = [];
  /** 当前选中的分类 id，null 表示「全部」 */
  activeCategoryId: number | null = null;
  /** 是否正在加载 */
  loading = true;
  /** 错误信息，null 表示无错误 */
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * 拉取分类与材料（可选按分类筛选）
   * @param categoryId 可选，传入则只拉取该分类下的材料
   */
  async load(categoryId?: number): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const [c, m] = await Promise.all([fetchCategories(), fetchMaterials(categoryId)]);
      runInAction(() => {
        this.categories = c;
        this.materials = m;
        if (categoryId !== undefined) {
          this.activeCategoryId = categoryId ?? null;
        }
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

  /** 选中「全部」分类并重新拉取 */
  selectAll(): void {
    this.activeCategoryId = null;
  }

  /** 选中指定分类并拉取该分类材料 */
  async selectCategory(id: number): Promise<void> {
    this.activeCategoryId = id;
    await this.load(id);
  }

  /** 重置错误 */
  clearError(): void {
    this.error = null;
  }
}
