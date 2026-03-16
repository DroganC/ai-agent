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
  { id: 1, code: 'urban', name: '办公楼场景', cover_url: 'https://dummyimage.com/300x160/ff4d4f/ffffff&text=Office' },
  { id: 2, code: 'factory', name: '厂区场景', cover_url: 'https://dummyimage.com/300x160/fa8c16/ffffff&text=Factory' },
];

export const modules: LevelModule[] = [
  { id: 11, scene_id: 1, name: '基础知识', order_no: 1 },
  { id: 12, scene_id: 1, name: '应急处置', order_no: 2 },
  { id: 21, scene_id: 2, name: '隐患排查', order_no: 1 },
];

export const levels: Level[] = [
  { id: 101, module_id: 11, game_type: 'quiz', name: '火灾报警与初期处置', difficulty: 2, unlock_prev_level_id: null, estimated_seconds: 120, reward_points: 30, status: 1, unlocked: true, best_score: 95, best_duration_ms: 115000 },
  { id: 102, module_id: 11, game_type: 'steps', name: '疏散逃生要点（低姿、捂口鼻）', difficulty: 3, unlock_prev_level_id: 101, estimated_seconds: 160, reward_points: 40, status: 1, unlocked: true, best_score: 88, best_duration_ms: 140000 },
  { id: 103, module_id: 11, game_type: 'link-match', name: '常见消防标识识别', difficulty: 2, unlock_prev_level_id: 102, estimated_seconds: 140, reward_points: 35, status: 1, unlocked: false },
  { id: 104, module_id: 11, game_type: 'classify-challenge', name: '分类大挑战：左右滑动归类', difficulty: 2, unlock_prev_level_id: 103, estimated_seconds: 120, reward_points: 40, status: 1, unlocked: false },
  { id: 201, module_id: 12, game_type: 'steps', name: '灭火器“四步法”（提、拔、握、压）', difficulty: 3, unlock_prev_level_id: null, estimated_seconds: 180, reward_points: 45, status: 1, unlocked: true },
  { id: 301, module_id: 21, game_type: 'challenge', name: '办公室隐患排查（电器/通道）', difficulty: 3, unlock_prev_level_id: null, estimated_seconds: 200, reward_points: 50, status: 1, unlocked: true },
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
