import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Space, Toast } from 'antd-mobile';
import { Page } from '../../components/common/Page';
import { Loading } from '../../components/common/Loading';
import { ErrorView } from '../../components/common/ErrorView';
import { PullToRefreshContainer } from '../../components/common/PullToRefreshContainer';
import { Icon } from '../../icons';
import { fetchScenes, fetchModules } from '../../services/scenes';
import { fetchLevelsByModule } from '../../services/levels';
import type { Level, LevelModule, Scene } from '../../types/api';
import { getErrorMessage } from '../../utils/error';
import { LevelGroup } from './components/LevelGroup';
import { useStores } from '../../stores';
import { PersonalInfoBlock } from '../../components/common/PersonalInfoBlock';
import { PersonalDashboard } from './components/PersonalDashboard';

/** 按模块聚合后的分组结构，用于首页展示 */
type LevelGroupItem = { module: LevelModule; levels: Level[] };

export function Home() {
  const navigate = useNavigate();
  const { authStore } = useStores();

  // ---------- 状态 ----------
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [modules, setModules] = useState<LevelModule[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);

  /**
   * 加载首页数据：场景列表 → 当前场景的模块列表 → 各模块下的游戏列表并扁平化
   */
  const load = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const sceneList = await fetchScenes();
      const activeScene: Scene | null = sceneList[0] ?? null;
      setScene(activeScene);

      if (!activeScene) {
        setModules([]);
        setLevels([]);
        setError(null);
        return;
      }

      const moduleList = await fetchModules(activeScene.id);
      setModules(moduleList);

      // 并行拉取各模块的游戏列表，再合并为一维数组
      const levelLists = await Promise.all(moduleList.map((m) => fetchLevelsByModule(m.id)));
      setLevels(levelLists.flat());
      setError(null);
    } catch (e: unknown) {
      setError(getErrorMessage(e, '加载失败'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /**
   * 将扁平游戏列表按 module_id 分组，并与 modules 顺序对齐，仅保留有游戏的组
   */
  const groups: LevelGroupItem[] = useMemo(() => {
    const map = new Map<number, Level[]>();
    for (const lv of levels) {
      const list = map.get(lv.module_id) ?? [];
      list.push(lv);
      map.set(lv.module_id, list);
    }
    return modules
      .map((m) => ({ module: m, levels: (map.get(m.id) ?? []).slice().sort((a, b) => a.id - b.id) }))
      .filter((g) => g.levels.length > 0);
  }, [levels, modules]);

  /** 点击某游戏：未解锁时提示，否则跳转游戏准备页 */
  const handleLevelClick = useCallback(
    (levelId: number): void => {
      const level = levels.find((l) => l.id === levelId);
      if (level && !level.unlocked) {
        Toast.show({ content: '该游戏未解锁（示例逻辑）', duration: 1200 });
        return;
      }
      navigate(`/level/${levelId}/prepare`);
    },
    [levels, navigate]
  );
  const handleLevelClickFromCard = useCallback(
    (levelId: number) => handleLevelClick(levelId),
    [handleLevelClick]
  );

  if (loading) return <Loading text="加载中" />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  return (
    <Page>
      <PullToRefreshContainer onRefresh={load}>
        <Space direction="vertical" block style={{ padding: 'var(--page-padding) var(--page-padding) 0', gap: 'var(--space-3)' }}>
        {/* 上半部：个人信息 + 个人看板 */}
        <div className="row">
          <div>
            <div className="title" style={{ fontSize: 'var(--font-h1)' }}>
              消防安全训练
            </div>
            <div className="subtle" style={{ marginTop: 'var(--space-1)' }}>
              欢迎回来，{authStore.user?.name ?? '学员'}
            </div>
          </div>
          <button
            type="button"
            className="actionPill"
            onClick={() => navigate('/levels', { state: { focusSearch: true } })}
            aria-label="搜索"
          >
            <Icon name="search" size={18} weight="bold" />
            <span className="actionPillText">搜索</span>
          </button>
        </div>

        <PersonalInfoBlock user={authStore.user} />

        {/* 个人看板：标题在卡片外，内容在 Card 内 */}
        <div>
          <div className="sectionTitle">个人看板</div>
          <Card style={{ borderRadius: 'var(--radius-card)' }}>
            <PersonalDashboard />
          </Card>
        </div>

        {/* 当前场景提示 + 场景训练标题 */}
        <div className="row" style={{ marginTop: 'var(--space-2)' }}>
          <div className="subtle">
            {scene ? `当前场景：${scene.name}` : '暂无场景'}
          </div>
          <button
            type="button"
            className="actionPill"
            onClick={() => navigate('/levels')}
            style={{ padding: '0 var(--space-3)', height: '0.7rem' }}
            aria-label="游戏列表"
          >
            <span className="actionPillText">游戏列表</span>
            <Icon name="caretRight" size={16} weight="bold" />
          </button>
        </div>

        {/* 场景训练：标题与内容同包一层，与个人看板一致，标题→内容仅受 sectionTitle margin 控制 */}
        <div>
          <div className="sectionTitle">场景训练</div>
          {groups.length === 0 && (
            <Card>
              <div style={{ color: '#6b7280', fontSize: '0.3rem' }}>暂无可用训练游戏</div>
            </Card>
          )}
          {groups.map((g) => (
            <LevelGroup
              key={g.module.id}
              module={g.module}
              levels={g.levels}
              onLevelClick={handleLevelClickFromCard}
            />
          ))}
        </div>
      </Space>
      </PullToRefreshContainer>
    </Page>
  );
}
