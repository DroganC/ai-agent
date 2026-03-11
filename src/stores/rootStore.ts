import { AuthStore } from './authStore.js';
import { UIStore } from './uiStore.js';
import { LevelsStore } from './levelsStore.js';
import { LearningStore } from './learningStore.js';
import { LeaderboardStore } from './leaderboardStore.js';
import { ProfileStore } from './profileStore.js';
import { StoreOrdersStore } from './storeOrdersStore.js';

/**
 * 根 Store，集中所有子 store，供 Provider 注入
 */
export class RootStore {
  authStore: AuthStore;
  uiStore: UIStore;
  /** 场景与关卡页 */
  levelsStore: LevelsStore;
  /** 学习中心页 */
  learningStore: LearningStore;
  /** 排行榜页 */
  leaderboardStore: LeaderboardStore;
  /** 个人主页 */
  profileStore: ProfileStore;
  /** 兑换记录页 */
  storeOrdersStore: StoreOrdersStore;

  constructor() {
    this.authStore = new AuthStore();
    this.uiStore = new UIStore();
    this.levelsStore = new LevelsStore();
    this.learningStore = new LearningStore();
    this.leaderboardStore = new LeaderboardStore();
    this.profileStore = new ProfileStore();
    this.storeOrdersStore = new StoreOrdersStore();
  }
}

