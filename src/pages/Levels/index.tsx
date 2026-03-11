import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { reaction } from 'mobx';
import { useNavigate } from 'react-router-dom';
import { useStores } from '../../stores';
import { Page } from '../../components/common/Page';
import { Loading } from '../../components/common/Loading';
import { ErrorView } from '../../components/common/ErrorView';
import { PageHeader } from '../../components/common/PageHeader';
import { SceneFilterRow } from './components/SceneFilterRow';
import { ModuleFilterRow } from './components/ModuleFilterRow';
import { LevelListItem } from './components/LevelListItem';

/**
 * 场景与关卡页（所有游戏入口）
 * 顶部分组筛选（场景 + 模块），下方为当前模块下的关卡/游戏列表，点击进入准备页
 * 状态由 levelsStore 统一管理，与 uiStore.scene 联动
 */
export const Levels = observer(function Levels() {
  const navigate = useNavigate();
  const { levelsStore, uiStore } = useStores();

  /** 监听当前场景变化，重新拉取场景/模块及首模块关卡 */
  useEffect(() => {
    const dispose = reaction(
      () => uiStore.scene,
      (sceneCode) => void levelsStore.loadScenesAndFirstLevels(sceneCode),
      { fireImmediately: true }
    );
    return () => dispose();
  }, [uiStore, levelsStore]);

  /** 重试：刷新页面 */
  const handleRetry = (): void => {
    window.location.reload();
  };

  if (levelsStore.loading) return <Loading />;
  if (levelsStore.error) return <ErrorView message={levelsStore.error} onRetry={handleRetry} />;

  return (
    <Page showTab={false}>
      <div className="screen">
        <div className="stack" style={{ gap: 'var(--space-3)' }}>
          <PageHeader
            title="场景与关卡"
            subtitle="按场景、模块筛选，选择关卡开始挑战"
            onBack={() => navigate(-1)}
          />

          <SceneFilterRow
            scenes={levelsStore.scenes}
            activeSceneCode={uiStore.scene}
            onSelect={(code) => uiStore.setScene(code)}
          />

          <ModuleFilterRow
            modules={levelsStore.modules}
            activeModuleId={levelsStore.activeModuleId}
            onSelect={(id) => void levelsStore.setActiveModuleAndLoadLevels(id)}
          />

          <div>
            <div className="sectionTitle">关卡</div>
            <div className="sectionCard">
              <ul className="sectionCardList">
                {levelsStore.levels.map((level) => (
                  <LevelListItem key={level.id} level={level} />
                ))}
                {levelsStore.levels.length === 0 && (
                  <li className="sectionCardList__item">
                    <span className="subtle">暂无关卡</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
});
