import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Swiper } from 'antd-mobile';
import { useBackToLevels } from '../../app/useBackToLevels';
import type { GameType, Level } from '../../types/api';
import { fetchLevel } from '../../services/levels';
import { getErrorMessage } from '../../utils/error';
import { Loading } from '../../components/common/Loading';
import { ErrorView } from '../../components/common/ErrorView';
import { LevelResultLayout } from '../../components/common/LevelResultLayout';
import type { PassCard } from '../../components/common/LevelPassView';
import { Icon } from '../../icons';
import { TYPES } from '../../components/games/link-match/types';
import co2Icon from '../../components/games/link-match/assets/co2.png';
import dryPowderIcon from '../../components/games/link-match/assets/dry-powder.png';
import waterBasedIcon from '../../components/games/link-match/assets/water-based.png';
import foamIcon from '../../components/games/link-match/assets/foam.png';

const TYPE_ICONS = [co2Icon, dryPowderIcon, waterBasedIcon, foamIcon] as const;

export function LevelPass() {
  const { id } = useParams<{ id: string }>();
  const levelId = id != null ? Number(id) : NaN;
  const navigate = useNavigate();

  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    if (!Number.isFinite(levelId)) {
      setError('无效的游戏 ID');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const lv = await fetchLevel(levelId);
      setLevel(lv);
    } catch (e: unknown) {
      setError(getErrorMessage(e, '加载失败'));
      setLevel(null);
    } finally {
      setLoading(false);
    }
  }, [levelId]);

  useEffect(() => {
    void load();
  }, [load]);

  const gameType: GameType | undefined = level?.game_type;

  const cards: PassCard[] = useMemo(() => {
    if (gameType === 'link-match' || gameType === 'llk') {
      return TYPES.map((t) => ({
        id: String(t.id),
        title: t.name,
        description: t.tip,
        media: <img src={TYPE_ICONS[t.id]} alt={t.name} style={{ width: 56, height: 56, objectFit: 'contain' }} />,
      }));
    }
    if (gameType === 'classify-challenge') {
      return [
        { id: 'k1', title: '小技巧', description: '遇到“带电/油锅/金属火”等关键题，先判断风险，再选择灭火方式或撤离报警。' },
        { id: 'k2', title: '复盘建议', description: '把每次做错的解释看完，再重新挑战，分数会提升得更快。' },
      ];
    }
    if (gameType === 'steps') {
      return [
        { id: 's1', title: '关键步骤优先', description: '关键错误扣分更重，先稳再快。' },
        { id: 's2', title: '用时加成', description: '在保证正确的前提下加快节奏，可获得时间加成。' },
      ];
    }
    if (gameType === 'spot-difference') {
      return [
        { id: 'sd1', title: '观察技巧', description: '上下对照，先看整体再盯细节，可减少误点。' },
        { id: 'sd2', title: '复盘建议', description: '错点过多时别慌，记下差异位置再玩一局。' },
      ];
    }
    return [];
  }, [gameType]);

  const onBackToLevels = useBackToLevels();

  const onReplay = useCallback(() => {
    if (!Number.isFinite(levelId)) return;
    navigate(`/level/${levelId}/prepare`, { replace: true });
  }, [levelId, navigate]);

  if (loading) return <Loading />;
  if (error != null) return <ErrorView message={error} onRetry={load} />;
  if (level == null) return <ErrorView message="游戏不存在" onRetry={load} />;

  const subtitle = '成绩已记录';
  const hasCards = Array.isArray(cards) && cards.length > 0;
  /** 仅连连看使用左右滑动 Swiper（多张带图卡片）；大家来找茬、分类、步骤等用垂直列表 */
  const useSwiper = gameType === 'link-match' || gameType === 'llk';

  return (
    <LevelResultLayout
      title="挑战成功"
      description={subtitle}
      onBackToLevels={onBackToLevels}
      onReplay={onReplay}
    >
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
          <div style={{ fontSize: 'var(--font-h2)', fontWeight: 900, color: 'var(--color-text)' }}>挑战成功</div>
          <div style={{ fontSize: 'var(--font-body)', color: 'var(--color-text-muted)' }}>{subtitle}</div>
        </div>
      </Card>
      {hasCards && (
        <div>
          <div className="sectionTitle">知识卡片</div>
          {useSwiper ? (
            <Swiper
              indicator={() => null}
              style={{ '--height': '200px' } as never}
              defaultIndex={0}
              loop
            >
              {cards.map((c) => (
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
          ) : (
            <div className="level-pass-cards-list">
              {cards.map((c) => (
                <Card key={c.id} style={{ borderRadius: 'var(--radius-card)' }} className="level-pass-card">
                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                    {c.media && <div style={{ width: 48, height: 48, flex: '0 0 auto', display: 'grid', placeItems: 'center' }}>{c.media}</div>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'var(--font-body)', fontWeight: 900, color: 'var(--color-text)' }}>{c.title}</div>
                      {c.description && (
                        <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-body)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                          {c.description}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </LevelResultLayout>
  );
}

