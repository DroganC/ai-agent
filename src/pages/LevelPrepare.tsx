import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchLevel } from '../services/levels';
import { fetchLife } from '../services/life';
import { createAttempt } from '../services/attempts';
import { Level } from '../types/api';
import { Page } from '../components/common/Page';
import { Loading } from '../components/common/Loading';
import { ErrorView } from '../components/common/ErrorView';
import { Icon } from '../icons';
import { Button } from '../components/common/Button';
import { getErrorMessage } from '../utils/error';

export const LevelPrepare = () => {
  const { id } = useParams<{ id: string }>();
  const levelId = Number(id);
  const navigate = useNavigate();
  const [level, setLevel] = useState<Level | null>(null);
  const [life, setLife] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const lv = await fetchLevel(levelId);
        setLevel(lv);
        const lifeInfo = await fetchLife();
        setLife(lifeInfo.life_count);
        setError(null);
      } catch (e: unknown) {
        setError(getErrorMessage(e, '加载失败'));
      } finally {
        setLoading(false);
      }
    };
    if (levelId) run();
  }, [levelId]);

  const handleStart = async () => {
    try {
      setStarting(true);
      const attempt = await createAttempt(levelId);
      navigate(`/level/${levelId}/play`, { state: { attemptId: attempt.id } });
    } catch (e: unknown) {
      setError(getErrorMessage(e, '开始失败'));
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <Loading />;
  if (error || !level) return <ErrorView message={error || '关卡不存在'} onRetry={() => window.location.reload()} />;

  return (
    <Page showTab={false}>
      <div className="mt-3 space-y-4">
        <div className="card p-4 shadow-sm space-y-2">
          <div className="text-lg font-semibold text-[#1f1f3d] flex items-center gap-2">
            <Icon name="checklist" size={18} weight="bold" className="text-primary" />
            {level.name}
          </div>
          <div className="text-sm text-gray-500">难度 {level.difficulty} ★ · 预计 {level.estimated_seconds ?? '--'}s</div>
        </div>
        <div className="card p-4 shadow-sm space-y-2">
          <div className="font-semibold text-[#1f1f3d] flex items-center gap-2">
            <Icon name="star" size={16} weight="fill" className="text-[#f59e0b]" />
            奖励
          </div>
          <div className="text-sm text-gray-600">通关积分 {level.reward_points}</div>
        </div>
        <div className="card p-4 shadow-sm space-y-2">
          <div className="font-semibold text-[#1f1f3d] flex items-center gap-2">
            <Icon name="success" size={16} weight="fill" className="text-green-600" />
            生命
          </div>
          <div className="text-sm">当前生命 {life} / 3</div>
          <div className="text-xs text-gray-500 mt-1">失败扣 1，生命=0 需复活。</div>
        </div>
        <Button full variant={life > 0 ? 'primary' : 'secondary'} disabled={life <= 0 || starting} onClick={handleStart}>
          {life > 0 ? '开始挑战' : '生命不足，去复活'}
        </Button>
        <Button full variant="secondary" onClick={() => navigate(-1)}>
          返回关卡列表
        </Button>
      </div>
    </Page>
  );
};
