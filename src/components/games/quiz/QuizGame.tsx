import { Page } from '../../common/Page';
import { PageHeader } from '../../common/PageHeader';
import { Button } from '../../common/Button';
import type { GameRenderProps } from '../renderGame';
import underConstruction from './assets/under-construction.svg';

/**
 * 答题类玩法（占位：内容置空，展示开发中缺省图）
 * 后续可替换为完整题库、计时、得分与上报逻辑。
 */
export default function QuizGame({ level, onExit }: GameRenderProps) {
  return (
    <Page showTab={false}>
      <div className="screen">
        <div className="stack">
          <PageHeader
            title={level.name}
            description="玩法类型：答题（开发中）"
            onBack={onExit}
          />

          <div
            className="quiz-game-placeholder"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-6) var(--space-4)',
              minHeight: '40vh',
            }}
          >
            <img
              src={underConstruction}
              alt="开发中"
              style={{ width: '100%', maxWidth: 240, height: 'auto', objectFit: 'contain' }}
            />
          </div>

          <Button full variant="secondary" onClick={onExit}>
            退出
          </Button>
        </div>
      </div>
    </Page>
  );
}

