import { makeAutoObservable } from 'mobx';
import type { SceneCode, TabKey } from '../types/api';

/**
 * 全局 UI 状态 Store
 * 管理当前场景、Tab、轻量模式、复活弹窗等
 */
export class UIStore {
  scene: SceneCode = 'urban';
  tab: TabKey = '/home';
  lightMode = false;
  reviveModalVisible = false;

  constructor() {
    makeAutoObservable(this);
  }

  // Scene switching only affects recommendation and list display.
  setScene(scene: SceneCode) {
    this.scene = scene;
  }

  setTab(tab: TabKey) {
    this.tab = tab;
  }

  toggleLightMode(on?: boolean) {
    this.lightMode = typeof on === 'boolean' ? on : !this.lightMode;
  }

  setReviveVisible(visible: boolean) {
    this.reviveModalVisible = visible;
  }
}

