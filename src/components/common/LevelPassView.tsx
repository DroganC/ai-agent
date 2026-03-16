import type { ReactNode } from 'react';
import { Card, Swiper } from 'antd-mobile';
import { Page } from './Page';
import { PageHeader } from './PageHeader';
import { Button } from './Button';
import { Icon } from '../../icons';

export type PassCard = {
  id: string;
  title: string;
  description?: string;
  media?: ReactNode;
};

export type LevelPassViewProps = {
  title: string;
  subtitle?: string;
  cards?: readonly PassCard[];
  onBackToLevels: () => void;
  onReplay: () => void;
};

export function LevelPassView({ title, subtitle, cards, onBackToLevels, onReplay }: LevelPassViewProps) {
  const hasCards = Array.isArray(cards) && cards.length > 0;

  return (
    <Page showTab={false}>
      <div style={{ padding: 'var(--page-padding) var(--page-padding) 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <PageHeader title="通关" onBack={onBackToLevels} />

        <Card style={{ borderRadius: 'var(--radius-card)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', textAlign: 'center' }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(16,185,129,.14)',
                color: 'rgb(16,185,129)',
              }}
            >
              <Icon name="success" size={40} weight="fill" />
            </div>
            <div style={{ fontSize: 'var(--font-h2)', fontWeight: 900, color: 'var(--color-text)' }}>{title}</div>
            {subtitle && <div style={{ fontSize: 'var(--font-body)', color: 'var(--color-text-muted)' }}>{subtitle}</div>}
          </div>
        </Card>

        {hasCards && (
          <div>
            <div className="sectionTitle">知识卡片</div>
            <Swiper
              indicator={() => null}
              style={{ '--height': '200px' } as never}
              defaultIndex={0}
              loop
            >
              {cards!.map((c) => (
                <Swiper.Item key={c.id}>
                  <Card style={{ borderRadius: 'var(--radius-card)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                      {c.media && <div style={{ width: 68, height: 68, flex: '0 0 auto', display: 'grid', placeItems: 'center' }}>{c.media}</div>}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 'var(--font-body)', fontWeight: 900, color: 'var(--color-text)' }}>{c.title}</div>
                        {c.description && (
                          <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-body)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                            {c.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="subtle" style={{ marginTop: 'var(--space-3)' }}>
                      左右滑动切换
                    </div>
                  </Card>
                </Swiper.Item>
              ))}
            </Swiper>
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button full variant="secondary" onClick={onBackToLevels}>
            回到列表
          </Button>
          <Button full onClick={onReplay}>
            重新游戏
          </Button>
        </div>
      </div>
    </Page>
  );
}

