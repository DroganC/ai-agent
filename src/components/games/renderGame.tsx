import { lazy, Suspense } from 'react';
import { Loading } from '../common/Loading';
import type { GameType, Level } from '../../types/api';

// 真实游戏组件采用 react.lazy 动态引入，避免首屏打包过大
const StepsGame = lazy(() => import('./steps/StepsGame'));
const QuizGame = lazy(() => import('./quiz/QuizGame'));
const LinkMatchGame = lazy(() => import('./link-match/LinkMatchGame'));
const ChallengeGame = lazy(() => import('./challenge/ChallengeGame'));

export type GameRenderProps = {
  /** 关卡数据（可用于关卡名、奖励、计时口径等） */
  level: Level;
  /** 游戏结束/退出后的回调，由页面决定跳转或结算 */
  onExit: () => void;
};

/**
 * 根据游戏类型渲染对应的真实游戏组件。
 * 约束：
 * - 所有游戏组件都必须支持 GameRenderProps
 * - 必须通过 react.lazy 动态引入
 */
export function renderGame(type: GameType, props: GameRenderProps) {
  const element = (() => {
    switch (type) {
      case 'steps':
        return <StepsGame {...props} />;
      case 'quiz':
        return <QuizGame {...props} />;
      case 'link-match':
        return <LinkMatchGame {...props} />;
      case 'challenge':
        return <ChallengeGame {...props} />;
      default: {
        // GameType 已限制取值；这里作为运行时兜底
        return <StepsGame {...props} />;
      }
    }
  })();

  return (
    <Suspense fallback={<Loading text="加载游戏中" />}>
      {element}
    </Suspense>
  );
}

