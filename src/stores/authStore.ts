import { makeAutoObservable } from 'mobx';

/** 当前登录用户信息（与接口/缓存一致） */
export type UserInfo = {
  id: number;
  name: string;
  department_name?: string;
  base_name?: string;
  total_score?: number;
  best_duration_ms?: number;
  points?: number;
  life?: number;
};

/**
 * 认证与用户信息 Store
 * 管理 token、用户信息及持久化
 */
export class AuthStore {
  token: string | null = null;
  user: UserInfo | null = null;

  constructor() {
    makeAutoObservable(this);
    const cached = localStorage.getItem('ehs-auth');
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as { token?: string | null; user?: UserInfo | null };
        this.token = parsed.token ?? null;
        this.user = parsed.user ?? null;
      } catch {
        localStorage.removeItem('ehs-auth');
      }
    }
  }

  setAuth(token: string, user: UserInfo) {
    this.token = token;
    this.user = user;
    localStorage.setItem('ehs-auth', JSON.stringify({ token, user }));
  }

  updateUser(user: Partial<UserInfo>) {
    if (!this.user) return;
    this.user = { ...this.user, ...user };
    localStorage.setItem('ehs-auth', JSON.stringify({ token: this.token, user: this.user }));
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('ehs-auth');
  }

  get isAuthed() {
    return Boolean(this.token);
  }
}

