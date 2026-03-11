import { Card, Space, Toast } from 'antd-mobile';
import { Page } from '../../common/Page';
import { Button } from '../../common/Button';
import type { GameRenderProps } from '../renderGame';

/**
 * 答题类玩法（占位真实游戏组件）
 * 后续可替换为完整题库、计时、得分与上报逻辑。
 */
export default function QuizGame({ level, onExit }: GameRenderProps) {
  return (
    <Page showTab={false}>
      <div className="screen">
        <div className="stack">
          <div className="title">{level.name}</div>
          <div className="subtle">玩法类型：答题（开发中）</div>

          <Card style={{ borderRadius: 'var(--radius-card)' }}>
            <div>
              <div className="sectionTitle">示例题目</div>
              <div className="sectionBody subtle" style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-body)' }}>
                火灾初期，拨打报警电话应优先说明哪些信息？（示例）
              </div>

              <Space direction="vertical" block style={{ marginTop: 'var(--space-4)' }}>
                <Button full onClick={() => Toast.show({ content: '回答已记录（示例）', duration: 1200 })}>
                  A. 地址 + 火情 + 联系方式
                </Button>
                <Button full variant="secondary" onClick={() => Toast.show({ content: '回答已记录（示例）', duration: 1200 })}>
                  B. 只说“着火了”
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

