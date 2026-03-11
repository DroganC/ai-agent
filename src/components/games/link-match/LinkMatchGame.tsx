import { Card, Space, Toast } from 'antd-mobile';
import { Page } from '../../common/Page';
import { Button } from '../../common/Button';
import type { GameRenderProps } from '../renderGame';

/**
 * 连连看/配对类玩法（占位真实游戏组件）
 * 后续可引入画布/拖拽/配对逻辑与计分规则。
 */
export default function LinkMatchGame({ level, onExit }: GameRenderProps) {
  return (
    <Page showTab={false}>
      <div className="screen">
        <div className="stack">
          <div className="title">{level.name}</div>
          <div className="subtle">玩法类型：连连看/配对（开发中）</div>

          <Card style={{ borderRadius: 'var(--radius-card)' }}>
            <div>
              <div className="sectionTitle">示例操作</div>
              <div className="sectionBody subtle" style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-body)' }}>
                将「灭火器」与「干粉」配对（示例）
              </div>
              <Space direction="horizontal" block style={{ marginTop: 'var(--space-4)' }}>
                <Button full onClick={() => Toast.show({ content: '已配对（示例）', duration: 1200 })}>
                  灭火器
                </Button>
                <Button full variant="secondary" onClick={() => Toast.show({ content: '已配对（示例）', duration: 1200 })}>
                  干粉
                </Button>
              </Space>
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

