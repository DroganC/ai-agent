import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, useLocation } from 'react-router-dom';
import { SearchBar } from 'antd-mobile';
import { useStores } from '../../stores';
import { Page } from '../../components/common/Page';
import { Loading } from '../../components/common/Loading';
import { ErrorView } from '../../components/common/ErrorView';
import { PageHeader } from '../../components/common/PageHeader';
import { PullToRefreshContainer } from '../../components/common/PullToRefreshContainer';
import { LevelListItem } from './components/LevelListItem';
import { SceneFilterRow } from './components/SceneFilterRow';

/**
 * 关卡列表页：展示全部关卡，支持场景筛选与关键词搜索；卡片显示所属场景与所属模块。
 */
/** 路由 state：可选 focusSearch 用于从其他页跳转时自动聚焦搜索框 */
type LevelsRouteState = { focusSearch?: boolean } | null;

export const Levels = observer(function Levels() {
  const navigate = useNavigate();
  const location = useLocation();
  const { levelsStore } = useStores();
  const focusSearch = (location.state as LevelsRouteState)?.focusSearch ?? false;

  /** 初始加载全部关卡 */
  useEffect(() => {
    void levelsStore.loadAllLevels();
  }, [levelsStore]);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeSceneId, setActiveSceneId] = useState<number | null>(null);

  const filteredLevels = useMemo(() => {
    let list = levelsStore.levels;
    if (activeSceneId != null) {
      const moduleIdsInScene = levelsStore.modules
        .filter((m) => m.scene_id === activeSceneId)
        .map((m) => m.id);
      list = list.filter((l) => moduleIdsInScene.includes(l.module_id));
    }
    const kw = searchKeyword.trim();
    if (!kw) return list;
    return list.filter((l) => l.name.includes(kw));
  }, [levelsStore.levels, levelsStore.modules, activeSceneId, searchKeyword]);

  const refresh = async (): Promise<void> => {
    await levelsStore.loadAllLevels();
  };

  if (levelsStore.loading) return <Loading />;
  if (levelsStore.error) return <ErrorView message={levelsStore.error} onRetry={() => void levelsStore.loadAllLevels()} />;

  return (
    <Page showTab={false}>
      <PullToRefreshContainer onRefresh={refresh}>
        <div className="screen levels-page">
          <div className="stack">
            <PageHeader
              title="关卡列表"
              subtitle="搜索关卡名称"
              onBack={() => navigate(-1)}
            />

            <div className="levels-filter-block">
              <SceneFilterRow
                scenes={levelsStore.scenes}
                activeSceneId={activeSceneId}
                onSelectAll={() => setActiveSceneId(null)}
                onSelectScene={(id) => setActiveSceneId(id)}
                noCard
              />
              <div className="levels-search-inner">
                <SearchBar
                  placeholder="搜索关卡名称"
                  value={searchKeyword}
                  onChange={setSearchKeyword}
                  autoFocus={focusSearch}
                  style={{ '--border-radius': 'var(--radius-sm)', '--background': 'var(--color-card)' } as CSSProperties}
                />
              </div>
            </div>

            <div className="levels-list-section">
              <div className="levels-list">
                {filteredLevels.map((level) => (
                  <LevelListItem
                    key={level.id}
                    level={level}
                    scenes={levelsStore.scenes}
                    modules={levelsStore.modules}
                  />
                ))}
                {filteredLevels.length === 0 && (
                  <div className="levels-empty">
                    {searchKeyword.trim() ? '无匹配关卡' : '暂无关卡'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </PullToRefreshContainer>
    </Page>
  );
});
