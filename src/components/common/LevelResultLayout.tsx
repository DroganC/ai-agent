import type { ReactNode } from 'react';
import { Page } from './Page';
import { PageHeader } from './PageHeader';
import { Button } from './Button';

/**
 * 关卡结果页统一布局（通关页 / 结算页共用）
 * - 顶部：大标题 + 可选返回（与列表页头部一致）
 * - 中间：可滚动内容（由调用方传入）
 * - 底部：吸底固定，「返回列表」「重新游戏」两个按钮
 */
export type LevelResultLayoutProps = {
  /** 顶部大标题，如「挑战成功」「结算完成」 */
  title: string;
  /** 标题下方可选描述 */
  description?: ReactNode;
  /** 中间可滚动区域内容 */
  children: ReactNode;
  /** 点击「返回列表」或头部返回时回调 */
  onBackToLevels: () => void;
  /** 点击「重新游戏」时回调（通常跳转到本关准备页） */
  onReplay: () => void;
};

export function LevelResultLayout({
  title,
  description,
  children,
  onBackToLevels,
  onReplay,
}: LevelResultLayoutProps) {
  return (
    <Page showTab={false}>
      <div className="game-intro">
        <div className="game-intro__scroll">
          <PageHeader title={title} description={description} onBack={onBackToLevels} />
          {children}
          <div className="game-intro__spacer" />
        </div>
        <div className="game-intro__bottom">
          <div className="game-intro__btn-wrap">
            <Button variant="secondary" full onClick={onBackToLevels}>
              返回列表
            </Button>
          </div>
          <div className="game-intro__btn-wrap">
            <Button full onClick={onReplay}>
              重新游戏
            </Button>
          </div>
        </div>
      </div>
    </Page>
  );
}
