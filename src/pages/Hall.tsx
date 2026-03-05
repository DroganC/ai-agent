import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { fetchMe } from '../services/user';
import { fetchScenes } from '../services/scenes';
import { fetchModules } from '../services/scenes';
import { fetchLevelsByModule } from '../services/levels';
import { Level, Scene } from '../types/api';
import { authStore, uiStore } from '../store';
import { Page } from '../components/common/Page';
import { Loading } from '../components/common/Loading';
import { ErrorView } from '../components/common/ErrorView';
import { Icon } from '../icons';
import { SectionHeader } from '../components/common/SectionHeader';
import { TagPill } from '../components/common/TagPill';
import { Button } from '../components/common/Button';
import { getErrorMessage } from '../utils/error';

export const Hall = observer(() => {
  const navigate = useNavigate();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [search, setSearch] = useState('');
  const [recommended, setRecommended] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await fetchMe();
        const sceneList = await fetchScenes();
        setScenes(sceneList);
        const activeScene = sceneList.find((s) => s.code === uiStore.scene) || sceneList[0];
        if (activeScene && uiStore.scene !== activeScene.code) uiStore.setScene(activeScene.code);
        const modules = activeScene ? await fetchModules(activeScene.id) : [];
        if (modules.length) {
          const lv = await fetchLevelsByModule(modules[0].id);
          setLevels(lv);
        } else {
          setLevels([]);
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

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={() => window.location.reload()} />;

  const user = authStore.user;
  return (
    <Page>
      <div className="mt-2 space-y-4">
        {/* 头部问候 + 快捷按钮 */}
        <SectionHeader
          title={<div className="text-2xl font-bold leading-tight">你好，{user?.name ?? '同事'}</div>}
          action={
            <button className="w-12 h-12 rounded-2xl bg-primary text-white text-2xl leading-none shadow-md flex items-center justify-center">
              <Icon name="plus" size={22} weight="bold" />
            </button>
          }
        />

        {/* 搜索框 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2 px-3 py-3 text-gray-500">
          <Icon name="search" size={18} weight="bold" />
          <input
            className="flex-1 outline-none text-sm placeholder-gray-400 bg-transparent"
            placeholder="搜索关卡或关键词"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Icon name="filter" size={18} weight="bold" />
        </div>

        {/* 标签页 */}
        <div className="flex gap-3">
          {['Overview', 'Analytics'].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-full text-sm ${
                tab === 'Overview' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 bg-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="card p-4">
          <SectionHeader title="按场景筛选" action={<div className="text-xs text-gray-400">共 {scenes.length} 个</div>} />
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

        <div className="card p-4 space-y-2">
          <SectionHeader
            title="关卡列表"
            action={<button className="text-primary text-sm" onClick={() => navigate('/levels')}>查看全部</button>}
          />
          <div className="flex flex-col gap-3">
            {levels
              .filter((level) => level.name.toLowerCase().includes(search.toLowerCase()))
              .map((level) => (
              <div key={level.id} className="p-3 rounded-2xl border border-slate-100 shadow-sm bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{level.name}</div>
                    <div className="text-xs text-gray-500">难度 {level.difficulty} ★ · 预计 {level.estimated_seconds ?? '--'}s</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${level.unlocked ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {level.unlocked ? '已解锁' : '未解锁'}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-600 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Icon name="star" size={14} weight="fill" className="text-[#f59e0b]" /> {level.reward_points} 积分</span>
                  <span className="flex items-center gap-1"><Icon name="clock" size={14} weight="bold" /> {level.estimated_seconds ?? '--'}s</span>
                  <span className="flex items-center gap-1"><Icon name="pin" size={14} weight="bold" /> 场景</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    full
                    variant={level.unlocked ? 'primary' : 'secondary'}
                    onClick={() => level.unlocked && navigate(`/level/${level.id}/prepare`)}
                    disabled={!level.unlocked}
                    className="px-5"
                  >
                    <span>{level.unlocked ? '开始挑战' : '未解锁'}</span>
                    <Icon name="caretRight" size={14} weight="bold" />
                  </Button>
                  <Button
                    variant={recommended[level.id] ? 'primary' : 'secondary'}
                    className="px-4"
                    onClick={() => setRecommended((prev) => ({ ...prev, [level.id]: !prev[level.id] }))}
                  >
                    <Icon name="star" size={16} weight="fill" className="text-[#f59e0b]" />
                    {recommended[level.id] ? '已推荐' : '推荐'}
                  </Button>
                </div>
              </div>
            ))}
            {levels.filter((level) => level.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
              <div className="text-sm text-gray-500 text-center py-6">未找到匹配的关卡</div>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
});
