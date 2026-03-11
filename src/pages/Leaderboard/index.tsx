import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores';
import { Page } from '../../components/common/Page';
import { Loading } from '../../components/common/Loading';
import { ErrorView } from '../../components/common/ErrorView';
import { PageHeader } from '../../components/common/PageHeader';
import { Icon } from '../../icons';
import { RankRow } from './components/RankRow';
import { ScopeTabs } from './components/ScopeTabs';

/**
 * 排行榜页
 * 按积分降序展示，支持全部/本部门切换；状态由 leaderboardStore 统一管理
 */
export const Leaderboard = observer(function Leaderboard() {
  const { authStore, leaderboardStore } = useStores();

  /** 初始加载 */
  useEffect(() => {
    void leaderboardStore.load();
  }, [leaderboardStore]);

  const myDept = authStore.user?.department_name;
  const viewData = leaderboardStore.getViewData(myDept);

  if (leaderboardStore.loading) return <Loading />;
  if (leaderboardStore.error) return <ErrorView message={leaderboardStore.error} onRetry={() => void leaderboardStore.load()} />;

  return (
    <Page>
      <div className="screen">
        <div className="stack" style={{ gap: 'var(--space-3)' }}>
          <PageHeader
            title="排行榜"
            subtitle="按积分降序 · 同分按用时更短排前"
            right={
              <button
                type="button"
                className="actionPill"
                onClick={() => void leaderboardStore.load()}
                aria-label="刷新排行榜"
              >
                <Icon name="refresh" size={18} weight="bold" />
                <span className="actionPillText">刷新</span>
              </button>
            }
          />

          <ScopeTabs
            scope={leaderboardStore.scope}
            onScopeChange={(s) => leaderboardStore.setScope(s)}
            myDepartmentName={myDept}
          />

          <div className="sectionCard">
            <ul className="sectionCardList">
              {viewData.map((item) => (
                <li key={item.user_id} className="sectionCardList__item">
                  <RankRow item={item} />
                </li>
              ))}
              {viewData.length === 0 && (
                <li className="sectionCardList__item">
                  <span className="subtle">暂无数据</span>
                </li>
              )}
            </ul>
          </div>

          <div className="subtle">更新于 {leaderboardStore.updatedAt}</div>
        </div>
      </div>
    </Page>
  );
});
