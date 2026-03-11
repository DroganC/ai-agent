import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from 'antd-mobile';
import { Page } from '../../components/common/Page';
import { Loading } from '../../components/common/Loading';
import { ErrorView } from '../../components/common/ErrorView';
import { Button } from '../../components/common/Button';
import { Icon } from '../../icons';
import { fetchLevel } from '../../services/levels';
import type { Level } from '../../types/api';
import { getErrorMessage } from '../../utils/error';

/**
 * 游戏首页（介绍页）
 * 展示关卡名称、难度、玩法说明、最佳成绩，提供「开始游戏」入口
 */
export function GameIntro() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [game, setGame] = useState<Level | null>(null);

  /** 根据 gameId 拉取关卡详情 */
  const load = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const id = Number(gameId);
      const data = await fetchLevel(id);
      setGame(data);
      setError(null);
    } catch (e: unknown) {
      setError(getErrorMessage(e, '加载失败'));
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <Loading text="加载中" />;
  if (error) return <ErrorView message={error} onRetry={load} />;
  if (!game) return <ErrorView message="游戏不存在" onRetry={() => navigate('/home')} />;

  return (
    <Page showTab={false}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: '100vh',
          paddingBottom: 'calc(var(--btn-primary-height) + var(--space-4) + env(safe-area-inset-bottom))',
        }}
      >
        <div className="screen" style={{ flex: 1, overflow: 'auto' }}>
          <div className="stack">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={{
                  border: '1px solid var(--color-line)',
                  background: 'var(--color-card)',
                  borderRadius: 999,
                  width: '0.84rem',
                  height: '0.84rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="返回"
              >
                <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}>
                  <Icon name="caretRight" size={18} weight="bold" />
                </span>
              </button>
              <div>
                <div className="title">游戏首页</div>
                <div className="subtle">查看玩法说明与最佳成绩</div>
              </div>
            </div>

            <Card style={{ borderRadius: 'var(--radius-card)' }}>
              <div>
                <div style={{ fontSize: 'var(--font-h2)', fontWeight: 900, color: 'var(--color-text)' }}>{game.name}</div>
                <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-caption)', color: 'var(--color-text-muted)' }}>
                  难度：{game.difficulty} ★ · 预计时长：{game.estimated_seconds ?? '--'} 秒 · 奖励积分：{game.reward_points}
                </div>
              </div>
            </Card>

            <div>
              <div className="sectionTitle">玩法说明</div>
              <Card style={{ borderRadius: 'var(--radius-card)' }}>
                <div className="sectionBody subtle" style={{ fontSize: 'var(--font-body)' }}>
                  - 按照提示完成关键步骤，减少误操作与关键错误。<br />
                  - 系统将根据完成情况与用时计算本局积分，并用于排行榜排序。
                </div>
              </Card>
            </div>

            <div>
              <div className="sectionTitle">我的最佳成绩</div>
              <Card style={{ borderRadius: 'var(--radius-card)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
                  <div>
                    <div className="statLabel">最高得分</div>
                    <div className="statValue">{game.best_score ?? '—'}</div>
                  </div>
                  <div>
                    <div className="statLabel">最佳用时</div>
                    <div className="statValue">
                      {game.best_duration_ms ? `${Math.round(game.best_duration_ms / 1000)}秒` : '—'}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <div className="sectionTitle">积分口径（示例）</div>
              <Card style={{ borderRadius: 'var(--radius-card)' }}>
                <div className="sectionBody subtle" style={{ fontSize: 'var(--font-body)' }}>
                  - 基础分：步骤完成得分累计<br />
                  - 时间因素：用时更短可获得额外加成<br />
                  - 错误扣分：误操作与关键错误会扣分
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            padding: 'var(--space-4)',
            paddingBottom: 'calc(var(--space-4) + env(safe-area-inset-bottom))',
            background: 'var(--color-bg)',
            borderTop: 'var(--hairline)',
            boxShadow: '0 -4px 12px rgba(17, 24, 39, 0.06)',
          }}
        >
          <Button full onClick={() => navigate(`/game/${game.id}/play`)}>
            开始游戏
          </Button>
        </div>
      </div>
    </Page>
  );
}
