import { makeAutoObservable, runInAction } from 'mobx';
import { fetchScenes, fetchModules } from '../services/scenes';
import { fetchLevelsByModule } from '../services/levels';
import { getErrorMessage } from '../utils/error';
import type { Scene, LevelModule, Level } from '../types/api';

/**
 * 场景与关卡页状态
 * 管理场景列表、模块列表、当前模块下的关卡列表及加载/错误状态
 */
export class LevelsStore {
  /** 场景列表 */
  scenes: Scene[] = [];
  /** 当前场景下的模块列表 */
  modules: LevelModule[] = [];
  /** 当前选中模块下的关卡/游戏列表 */
  levels: Level[] = [];
  /** 当前选中的模块 id，null 表示未选 */
  activeModuleId: number | null = null;
  /** 是否正在加载（场景+模块+关卡） */
  loading = true;
  /** 错误信息，null 表示无错误 */
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * 拉取场景与模块，并拉取当前场景下首模块的关卡列表
   * 需传入当前选中的 sceneCode，用于与 uiStore.scene 同步
   */
  async loadScenesAndFirstLevels(sceneCode: string): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const sceneList = await fetchScenes();
      const activeScene = sceneList.find((s) => s.code === sceneCode) ?? sceneList[0];
      const moduleList = activeScene ? await fetchModules(activeScene.id) : [];
      const firstModule = moduleList[0];
      let levels: Level[] = [];
      if (firstModule) {
        levels = await fetchLevelsByModule(firstModule.id);
      }
      runInAction(() => {
        this.scenes = sceneList;
        this.modules = moduleList;
        this.activeModuleId = firstModule?.id ?? null;
        this.levels = levels;
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

  /**
   * 切换当前模块并拉取该模块下的关卡列表
   */
  async setActiveModuleAndLoadLevels(moduleId: number): Promise<void> {
    this.activeModuleId = moduleId;
    this.error = null;
    try {
      const list = await fetchLevelsByModule(moduleId);
      runInAction(() => {
        this.levels = list;
      });
    } catch (e: unknown) {
      runInAction(() => {
        this.error = getErrorMessage(e, '加载失败');
      });
    }
  }

  /**
   * 拉取全部关卡：遍历所有场景 → 模块 → 关卡，扁平化列表
   * 用于关卡列表页（无场景/模块筛选）展示全部关卡，并保留 scenes/modules 供卡片展示所属信息
   */
  async loadAllLevels(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const sceneList = await fetchScenes();
      const allModules: LevelModule[] = [];
      const allLevels: Level[] = [];
      for (const scene of sceneList) {
        const moduleList = await fetchModules(scene.id);
        allModules.push(...moduleList);
        for (const m of moduleList) {
          const levels = await fetchLevelsByModule(m.id);
          allLevels.push(...levels);
        }
      }
      runInAction(() => {
        this.scenes = sceneList;
        this.modules = allModules;
        this.levels = allLevels;
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

  /** 重置错误，便于重试 */
  clearError(): void {
    this.error = null;
  }
}
