export type ApiMeta = {
  requestId: string;
  total?: number;
  limit?: number;
  offset?: number;
};

export type ApiResponse<T> = {
  data: T;
  meta: ApiMeta;
};

export type ApiErrorPayload = {
  error: {
    code: string;
    message: string;
  };
  meta?: ApiMeta;
};

export type Scene = { id: number; code: string; name: string; cover_url?: string };
export type SceneCode = Scene['code'];

export type LevelModule = { id: number; scene_id: number; name: string; order_no: number };

export type Level = {
  id: number;
  module_id: number;
  name: string;
  difficulty: number;
  unlock_prev_level_id?: number | null;
  estimated_seconds?: number;
  reward_points: number;
  status: number;
  best_score?: number;
  best_duration_ms?: number;
  unlocked?: boolean;
};

export type AttemptStatus = 'in_progress' | 'passed' | 'failed' | 'aborted';
export type AttemptFailReason = 'timeout' | 'key_error' | 'manual_abort' | 'other';

export type Attempt = {
  id: number;
  level_id: number;
  status: AttemptStatus;
  start_at: string;
  end_at?: string;
  duration_ms?: number;
  score?: number;
  fail_reason?: AttemptFailReason;
  error_count?: number;
  key_error_count?: number;
};

export type AttemptEvent = {
  event_type: 'step_ok' | 'step_error';
  step_id: string;
  knowledge_point?: string;
  error_type?: 'mis_touch' | 'missed_step' | 'wrong_order' | 'timeout' | 'other';
  is_key_error?: boolean;
  ts?: string;
};

export type AttemptReviewTimelineItem = {
  ts: string;
  step: string;
  result: 'ok' | 'error';
  knowledge_point?: string;
};

export type AttemptReview = {
  timeline: AttemptReviewTimelineItem[];
};

export type LifeInfo = { life_count: number; daily_reset_date: string; today_revive_used: number; today_revive_limit: number };
export type LeaderboardItem = { user_id: number; name: string; department_name?: string; total_score: number; best_duration_ms: number; rank: number; is_me?: boolean };
export type LeaderboardResponse = { items: LeaderboardItem[]; updatedAt: string };

export type PointTransaction = {
  id: number;
  change: number;
  balance_after: number;
  reason: string;
  created_at: string;
};

export type StoreItem = { id: number; name: string; type: 'virtual' | 'physical'; cost_points: number; stock: number; status: number; cover_url?: string };
export type StoreOrder = { id: number; item_id: number; status: string; cost_points: number; created_at: string };
export type LearningCategory = { id: number; parent_id?: number | null; name: string };
export type LearningMaterial = { id: number; title: string; type: 'doc' | 'video' | 'image' | 'link'; category_id: number; url: string; status: number };

export type TabKey = '/hall' | '/leaderboard' | '/profile';

export type PlayRouteState = {
  attemptId: number;
};

export type LoginRouteState = {
  from?: string;
};
