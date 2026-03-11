import { Navigate, useParams } from 'react-router-dom';

/**
 * 将旧路径 /game/:gameId 重定向到统一游戏首页 /level/:gameId/prepare
 */
export function RedirectGameToLevelPrepare() {
  const { gameId } = useParams<{ gameId: string }>();
  return <Navigate to={gameId ? `/level/${gameId}/prepare` : '/levels'} replace />;
}
