import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { useStores } from '../../stores';
import { Page } from '../../components/common/Page';
import { Loading } from '../../components/common/Loading';
import { ErrorView } from '../../components/common/ErrorView';
import { PullToRefreshContainer } from '../../components/common/PullToRefreshContainer';
import { PersonalInfoBlock } from '../../components/common/PersonalInfoBlock';
import { QuickEntryGrid, type QuickEntryItem } from './components/QuickEntryGrid';

/** 积分变动原因到展示文案的映射 */
const REASON_LABELS: Record<string, string> = {
  level_pass: '通关奖励',
  redeem: '积分兑换',
};

/** 将接口返回的 reason 转为用户可读文案 */
function reasonText(reason: string): string {
  return REASON_LABELS[reason] ?? reason;
}

/** 个人主页快捷入口配置 */
const QUICK_ENTRIES: QuickEntryItem[] = [
  { label: '学习中心', icon: 'checklist', to: '/learning' },
  { label: '积分商城', icon: 'bag', to: '/store' },
];

/**
 * 个人主页
 * 展示个人信息、成绩统计、快捷入口、积分明细；状态由 authStore + profileStore 统一管理
 */
export const Profile = observer(function Profile() {
  const navigate = useNavigate();
  const { authStore, profileStore } = useStores();

  useEffect(() => {
    void profileStore.load();
  }, [profileStore]);

  const handleQuickEntryNavigate = (path: string): void => {
    navigate(path);
  };

  if (profileStore.loading) return <Loading />;
  if (profileStore.error) return <ErrorView message={profileStore.error} onRetry={() => void profileStore.load()} />;

  const user = authStore.user;
  const bestDurationSec: number | null = user?.best_duration_ms ? Math.round(user.best_duration_ms / 1000) : null;

  return (
    <Page>
      <PullToRefreshContainer onRefresh={async () => { await profileStore.load(); }}>
        <div className="screen">
          <div className="stack" style={{ gap: 'var(--space-3)' }}>
          <div className="row">
            <div>
              <div className="title" style={{ fontSize: 'var(--font-h1)' }}>
                个人主页
              </div>
              <div className="subtle" style={{ marginTop: 'var(--space-1)' }}>
                展示部门信息与个人成绩统计
              </div>
            </div>
          </div>

          <PersonalInfoBlock user={user} life={profileStore.life} />

          <div>
            <div className="sectionTitle">成绩统计</div>
            <div className="sectionCard">
              <div className="sectionCardStats">
                <div>
                  <div className="statLabel">总得分</div>
                  <div className="statValue">{user?.total_score ?? 0}</div>
                </div>
                <div>
                  <div className="statLabel">最佳用时</div>
                  <div className="statValue">{bestDurationSec != null ? `${bestDurationSec}秒` : '—'}</div>
                </div>
                <div>
                  <div className="statLabel">可用积分</div>
                  <div className="statValue">{user?.points ?? 0}</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="sectionTitle">快捷入口</div>
            <div className="sectionCard">
              <QuickEntryGrid entries={QUICK_ENTRIES} onNavigate={handleQuickEntryNavigate} />
            </div>
          </div>

          <div>
            <div className="sectionTitle">积分明细</div>
            <div className="sectionCard">
              <ul className="sectionCardList">
                {profileStore.pointFlows.map((f) => (
                  <li key={f.id} className="sectionCardList__item">
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 'var(--font-body)', fontWeight: 600, color: 'var(--color-text)' }}>
                        {reasonText(f.reason)}
                      </div>
                      <div className="subtle" style={{ marginTop: 'var(--space-1)' }}>
                        {new Date(f.created_at).toLocaleString()}
                      </div>
                    </div>
                    <span
                      style={{
                        flex: '0 0 auto',
                        color: f.change > 0 ? 'var(--color-success)' : 'var(--color-danger)',
                        fontWeight: 900,
                        fontSize: 'var(--font-body)',
                      }}
                    >
                      {f.change > 0 ? `+${f.change}` : f.change}
                    </span>
                  </li>
                ))}
                {profileStore.pointFlows.length === 0 && (
                  <li className="sectionCardList__item">
                    <span className="subtle">暂无积分记录</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
          </div>
        </div>
      </PullToRefreshContainer>
    </Page>
  );
});
