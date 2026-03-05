import { makeAutoObservable } from 'mobx';
import type { SceneCode, TabKey } from '../types/api';

class UIStore {
  scene: SceneCode = 'urban';
  tab: TabKey = '/hall';
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

export const uiStore = new UIStore();
