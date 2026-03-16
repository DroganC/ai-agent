import { lazy, Suspense } from 'react';
import { Loading } from '../common/Loading';
import type { GameType, Level } from '../../types/api';

// 真实游戏组件采用 react.lazy 动态引入，避免首屏打包过大
const StepsGame = lazy(() => import('./steps/StepsGame')); // 步骤类玩法
const QuizGame = lazy(() => import('./quiz/QuizGame')); // 答题类
const LinkMatchGame = lazy(() => import('./link-match/LinkMatchGame')); // 连连看（消防器材识别）
const ChallengeGame = lazy(() => import('./challenge/ChallengeGame')); // 闯关/挑战类
const ClassifyChallengeGame = lazy(() => import('./classify-challenge/ClassifyChallengeGame')); // 分类大挑战（左右滑动归类）

export type GameRenderProps = {
  /** 关卡数据（可用于关卡名、奖励、计时口径等） */
  level: Level;
  /** 游戏结束/退出后的回调，由页面决定跳转或结算 */
  onExit: () => void;
};

/**
 * 根据游戏类型渲染对应的真实游戏组件。
 *
 * 游戏类型与中文名称对应：
 * - steps：步骤类玩法
 * - quiz：答题类
 * - link-match / llk：连连看（消防器材识别）
 * - challenge：闯关/挑战类
 * - classify-challenge：分类大挑战（左右滑动归类）
 *
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
      case 'llk': // llk 为连连看别名，与 link-match 共用同一组件
        return <LinkMatchGame {...props} />;
      case 'challenge':
        return <ChallengeGame {...props} />;
      case 'classify-challenge':
        return <ClassifyChallengeGame {...props} />;
      default: {
        // GameType 已限制取值；这里作为运行时兜底，默认渲染连连看
        return <LinkMatchGame {...props} />;
      }
    }
  })();

  return (
    <Suspense fallback={<Loading text="加载游戏中" />}>
      {element}
    </Suspense>
  );
}

