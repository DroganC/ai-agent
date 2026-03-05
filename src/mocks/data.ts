import { Attempt, LearningCategory, LearningMaterial, LeaderboardItem, Level, LevelModule, Scene, StoreItem, StoreOrder } from '../types/api';

export const mockUser = {
  id: 1,
  name: '张晨',
  department_name: '安全运营部',
  base_name: '上海基地',
  total_score: 1280,
  best_duration_ms: 182000,
  points: 540,
  life: 3,
};

export const scenes: Scene[] = [
  { id: 1, code: 'urban', name: '城市场景', cover_url: 'https://dummyimage.com/300x160/0064ff/ffffff&text=Urban' },
  { id: 2, code: 'factory', name: '工厂场景', cover_url: 'https://dummyimage.com/300x160/004bb5/ffffff&text=Factory' },
];

export const modules: LevelModule[] = [
  { id: 11, scene_id: 1, name: '基础安全', order_no: 1 },
  { id: 12, scene_id: 1, name: '设备操作', order_no: 2 },
  { id: 21, scene_id: 2, name: '生产安全', order_no: 1 },
];

export const levels: Level[] = [
  { id: 101, module_id: 11, name: '进入现场前检查', difficulty: 2, unlock_prev_level_id: null, estimated_seconds: 120, reward_points: 30, status: 1, unlocked: true, best_score: 95, best_duration_ms: 115000 },
  { id: 102, module_id: 11, name: '穿戴防护装备', difficulty: 3, unlock_prev_level_id: 101, estimated_seconds: 160, reward_points: 40, status: 1, unlocked: true, best_score: 88, best_duration_ms: 140000 },
  { id: 103, module_id: 11, name: '危险源辨识', difficulty: 4, unlock_prev_level_id: 102, estimated_seconds: 200, reward_points: 50, status: 1, unlocked: false },
  { id: 201, module_id: 12, name: '设备上电流程', difficulty: 3, unlock_prev_level_id: null, estimated_seconds: 180, reward_points: 35, status: 1, unlocked: true },
  { id: 301, module_id: 21, name: '化学品存储', difficulty: 4, unlock_prev_level_id: null, estimated_seconds: 220, reward_points: 45, status: 1, unlocked: true },
];

export const leaderboard: LeaderboardItem[] = Array.from({ length: 15 }).map((_, idx) => ({
  user_id: idx + 1,
  name: idx === 0 ? mockUser.name : `同事${idx + 1}`,
  department_name: idx % 2 === 0 ? '安全运营部' : '生产部',
  total_score: 1400 - idx * 20,
  best_duration_ms: 170000 + idx * 3000,
  rank: idx + 1,
  is_me: idx === 0,
}));

export const storeItems: StoreItem[] = [
  { id: 1, name: '咖啡券', type: 'virtual', cost_points: 200, stock: 99, status: 1, cover_url: 'https://dummyimage.com/200x200/0064ff/ffffff&text=Coffee' },
  { id: 2, name: '安全头盔', type: 'physical', cost_points: 500, stock: 5, status: 1, cover_url: 'https://dummyimage.com/200x200/004bb5/ffffff&text=Helmet' },
];

export const storeOrders: StoreOrder[] = [];

export const pointTransactions = [
  { id: 1, change: +40, balance_after: 540, reason: 'level_pass', created_at: new Date().toISOString() },
  { id: 2, change: -200, balance_after: 500, reason: 'redeem', created_at: new Date(Date.now() - 86400000).toISOString() },
];

export const learningCategories: LearningCategory[] = [
  { id: 1, parent_id: null, name: '基础知识' },
  { id: 2, parent_id: null, name: '设备操作' },
];

export const learningMaterials: LearningMaterial[] = [
  { id: 101, title: '现场检查要点', type: 'doc', category_id: 1, url: '#', status: 1 },
  { id: 102, title: '防护装备穿戴视频', type: 'video', category_id: 1, url: '#', status: 1 },
  { id: 201, title: '设备上电 SOP', type: 'doc', category_id: 2, url: '#', status: 1 },
];

export const attempts: Attempt[] = [];
