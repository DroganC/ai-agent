import { Card } from 'antd-mobile';
import { Page } from '../../common/Page';
import { PageHeader } from '../../common/PageHeader';
import { Button } from '../../common/Button';
import type { GameRenderProps } from '../renderGame';

/**
 * 闯关类玩法（占位真实游戏组件）
 * 这里先做一个最小骨架，后续可扩展游戏状态机、地图/关卡选择、玩法等。
 */
export default function ChallengeGame({ level, onExit }: GameRenderProps) {
  return (
    <Page showTab={false}>
      <div className="screen">
        <div className="stack">
          <PageHeader
            title={level.name}
            description="玩法类型：闯关（开发中）"
            onBack={onExit}
          />

          <Card style={{ borderRadius: 'var(--radius-card)' }}>
            <div>
              <div className="sectionTitle">提示</div>
              <div className="sectionBody subtle" style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-body)' }}>
                这里将实现“隐患排查/路线规划/事件处理”等闯关玩法。\n              </div>
            </div>
          </Card>

          <Button full variant="secondary" onClick={onExit}>
            退出
          </Button>
        </div>
      </div>
    </Page>
  );
}

