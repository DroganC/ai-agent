import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { fetchScenes, fetchModules } from '../services/scenes';
import { fetchLevelsByModule } from '../services/levels';
import { Scene, LevelModule, Level } from '../types/api';
import { uiStore } from '../store';
import { Page } from '../components/common/Page';
import { Loading } from '../components/common/Loading';
import { ErrorView } from '../components/common/ErrorView';
import { TagPill } from '../components/common/TagPill';
import { Icon } from '../icons';
import { Button } from '../components/common/Button';
import { IconButton } from '../components/common/IconButton';
import { getErrorMessage } from '../utils/error';

export const Levels = observer(() => {
  const navigate = useNavigate();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [modules, setModules] = useState<LevelModule[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<number | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const sceneList = await fetchScenes();
        setScenes(sceneList);
        const activeScene = sceneList.find((s) => s.code === uiStore.scene) || sceneList[0];
        if (activeScene) uiStore.setScene(activeScene.code);
        const moduleList = activeScene ? await fetchModules(activeScene.id) : [];
        setModules(moduleList);
        const firstModule = moduleList[0];
        if (firstModule) {
          setActiveModule(firstModule.id);
          const lv = await fetchLevelsByModule(firstModule.id);
          setLevels(lv);
        }
        setError(null);
      } catch (e: unknown) {
        setError(getErrorMessage(e, '加载失败'));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [uiStore.scene]);

  useEffect(() => {
    const loadLevels = async () => {
      if (!activeModule) return;
      try {
        const lv = await fetchLevelsByModule(activeModule);
        setLevels(lv);
      } catch (e: unknown) {
        setError(getErrorMessage(e, '加载失败'));
      }
    };
    loadLevels();
  }, [activeModule]);

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={() => window.location.reload()} />;

  return (
    <Page>
      <div className="mt-3 space-y-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-base font-semibold">按场景筛选</div>
            <div className="text-xs text-gray-400">共 {scenes.length} 个</div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 flex-nowrap">
            {scenes.map((s) => {
              const active = uiStore.scene === s.code;
              return (
                <button key={s.id} onClick={() => uiStore.setScene(s.code)}>
                  <TagPill active={active}>{s.name}</TagPill>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex gap-2 overflow-x-auto pb-1 flex-nowrap">
            {modules.map((m) => {
              const active = activeModule === m.id;
              return (
                <button key={m.id} onClick={() => setActiveModule(m.id)}>
                  <TagPill active={active}>{m.name}</TagPill>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
            {levels.map((level) => (
              <div key={level.id} className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-base">{level.name}</div>
                    <div className="text-xs text-gray-500 mt-1">难度 {level.difficulty} ★ · 预计 {level.estimated_seconds ?? '--'}s</div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${level.unlocked ? 'bg-[#e8f7ef] text-[#1c8c4a]' : 'bg-gray-100 text-gray-500'}`}>
                    {level.unlocked ? '已解锁' : '未解锁'}
                  </span>
                </div>
                <div className="mt-3 text-xs text-gray-600 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Icon name="star" size={14} weight="fill" className="text-[#f59e0b]" /> {level.reward_points} 积分</span>
                  <span className="flex items-center gap-1"><Icon name="clock" size={14} weight="bold" /> {level.estimated_seconds ?? '--'}s</span>
                  <span className="flex items-center gap-1"><Icon name="pin" size={14} weight="bold" /> 场景</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    full
                    variant={level.unlocked ? 'primary' : 'secondary'}
                    onClick={() => level.unlocked && navigate(`/level/${level.id}/prepare`)}
                    disabled={!level.unlocked}
                  >
                    <span>{level.unlocked ? '开始挑战' : '未解锁'}</span>
                    <Icon name="caretRight" size={14} weight="bold" />
                  </Button>
                  <IconButton icon="star" label="推荐" active={false} />
                </div>
              </div>
            ))}
          </div>
      </div>
    </Page>
  );
});
