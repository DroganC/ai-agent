import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { GameType, Level, PlayRouteState } from '../../types/api';
import { fetchLevel } from '../../services/levels';
import { getErrorMessage } from '../../utils/error';
import { Loading } from '../../components/common/Loading';
import { ErrorView } from '../../components/common/ErrorView';
import { LevelPassView, type PassCard } from '../../components/common/LevelPassView';
import { TYPES } from '../../components/games/link-match/types';
import co2Icon from '../../components/games/link-match/assets/co2.png';
import dryPowderIcon from '../../components/games/link-match/assets/dry-powder.png';
import waterBasedIcon from '../../components/games/link-match/assets/water-based.png';
import foamIcon from '../../components/games/link-match/assets/foam.png';

const TYPE_ICONS = [co2Icon, dryPowderIcon, waterBasedIcon, foamIcon] as const;

export function LevelPass() {
  const { id } = useParams<{ id: string }>();
  const levelId = id != null ? Number(id) : NaN;
  const { state } = useLocation();
  const attemptId: number | undefined = (state as PlayRouteState | null)?.attemptId;
  const navigate = useNavigate();

  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    if (!Number.isFinite(levelId)) {
      setError('无效的关卡 ID');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const lv = await fetchLevel(levelId);
      setLevel(lv);
    } catch (e: unknown) {
      setError(getErrorMessage(e, '加载失败'));
      setLevel(null);
    } finally {
      setLoading(false);
    }
  }, [levelId]);

  useEffect(() => {
    void load();
  }, [load]);

  const gameType: GameType | undefined = level?.game_type;

  const cards: PassCard[] = useMemo(() => {
    if (gameType === 'link-match' || gameType === 'llk') {
      return TYPES.map((t) => ({
        id: String(t.id),
        title: t.name,
        description: t.tip,
        media: <img src={TYPE_ICONS[t.id]} alt={t.name} style={{ width: 56, height: 56, objectFit: 'contain' }} />,
      }));
    }
    if (gameType === 'classify-challenge') {
      return [
        { id: 'k1', title: '小技巧', description: '遇到“带电/油锅/金属火”等关键题，先判断风险，再选择灭火方式或撤离报警。' },
        { id: 'k2', title: '复盘建议', description: '把每次做错的解释看完，再重新挑战，分数会提升得更快。' },
      ];
    }
    if (gameType === 'steps') {
      return [
        { id: 's1', title: '关键步骤优先', description: '关键错误扣分更重，先稳再快。' },
        { id: 's2', title: '用时加成', description: '在保证正确的前提下加快节奏，可获得时间加成。' },
      ];
    }
    return [];
  }, [gameType]);

  const onBackToLevels = useCallback(() => {
    navigate('/levels', { replace: true });
  }, [navigate]);

  const onReplay = useCallback(() => {
    if (!Number.isFinite(levelId)) return;
    // 重新从准备页进入，保证会重新创建 attempt
    navigate(`/level/${levelId}/prepare`, { replace: true });
  }, [levelId, navigate]);

  if (loading) return <Loading />;
  if (error != null) return <ErrorView message={error} onRetry={load} />;
  if (level == null) return <ErrorView message="关卡不存在" onRetry={load} />;

  return (
    <LevelPassView
      title="挑战成功"
      subtitle={attemptId != null ? `成绩已记录 · attemptId ${attemptId}` : '成绩已记录'}
      cards={cards}
      onBackToLevels={onBackToLevels}
      onReplay={onReplay}
    />
  );
}

