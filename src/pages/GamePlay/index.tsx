import { useNavigate, useParams } from 'react-router-dom';
import { Loading } from '../../components/common/Loading';
import { ErrorView } from '../../components/common/ErrorView';
import { fetchLevel } from '../../services/levels';
import { getErrorMessage } from '../../utils/error';
import type { GameType, Level } from '../../types/api';
import { renderGame } from '../../components/games';
import { useCallback, useEffect, useState } from 'react';

/**
 * 游戏页容器
 * - 负责拉取关卡详情
 * - 根据关卡的 game_type 动态渲染真实游戏组件（react.lazy）
 */
export function GamePlay() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();

  const [game, setGame] = useState<Level | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /** 拉取当前关卡详情，用于展示名称等 */
  const load = useCallback(async (): Promise<void> => {
    const id = Number(gameId);
    if (!Number.isFinite(id)) {
      setError('无效的游戏 ID');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const level = await fetchLevel(id);
      setGame(level);
    } catch (e: unknown) {
      setError(getErrorMessage(e, '加载失败'));
      setGame(null);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={load} />;
  if (!game) return <ErrorView message="未找到游戏" onRetry={load} />;

  // 默认使用 steps（示例步骤玩法），后续后端可按关卡配置下发 game_type
  const type: GameType = game.game_type ?? 'steps';

  return renderGame(type, {
    level: game,
    onExit: () => navigate(`/game/${gameId}`, { replace: true }),
  });
}
