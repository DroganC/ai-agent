import type { ReactNode } from 'react';
import type { UserInfo } from '../../stores/authStore';
import { Tag } from 'antd-mobile';

export type PersonalInfoBlockProps = {
  /** 当前登录用户信息（可为空，占位展示） */
  user: UserInfo | null;
  /** 生命值（我的页有接口时传入，会多展示「生命 x/3」） */
  life?: number;
  /** 根节点样式，如放入 Card 内时可传 { paddingTop: 0 } */
  style?: React.CSSProperties;
  /** 根节点类名 */
  className?: string;
};

/**
 * 个人信息区（.personalInfoBlock）
 * 首页直接使用（无 Card）；我的页面在 Card 内引用。
 * 取值逻辑统一：姓名、部门、基地、总积分、可用积分；可选展示生命。
 */
export function PersonalInfoBlock({ user, life, style: styleProp, className }: PersonalInfoBlockProps) {
  const initial = user?.name ? user.name.slice(0, 1) : '我';
  const dept = user?.department_name ?? '未分配';
  const base = user?.base_name ?? '—';
  const points = user?.points ?? 0;
  const totalScore = user?.total_score ?? 0;

  const tags: ReactNode[] = [
    <Tag key="total" color="primary" fill="solid">
      总积分 {totalScore}
    </Tag>,
    <Tag key="points" color="warning" fill="outline">
      可用积分 {points}
    </Tag>,
  ];
  if (life !== undefined) {
    tags.push(
      <Tag key="life" color="warning" fill="outline">
        生命 {life} / 3
      </Tag>
    );
  }

  return (
    <div className={className ? `personalInfoBlock ${className}` : 'personalInfoBlock'} style={styleProp}>
      <div className="personalInfoBlock__avatar">{initial}</div>
      <div className="personalInfoBlock__body">
        <div className="personalInfoBlock__name">{user?.name ?? '未命名用户'}</div>
        <div className="personalInfoBlock__meta subtle">
          部门：{dept} · 基地：{base}
        </div>
        <div className="personalInfoBlock__tags">{tags}</div>
      </div>
    </div>
  );
}
