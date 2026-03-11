import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchLevel } from '../../services/levels';
import { fetchLife } from '../../services/life';
import { createAttempt } from '../../services/attempts';
import type { Level } from '../../types/api';
import { Page } from '../../components/common/Page';
import { Loading } from '../../components/common/Loading';
import { ErrorView } from '../../components/common/ErrorView';
import { Icon } from '../../icons';
import { Button } from '../../components/common/Button';
import { getErrorMessage } from '../../utils/error';
import { Card } from 'antd-mobile';

/**
 * 关卡准备页
 * 展示关卡信息、奖励、生命值，点击「开始挑战」创建 attempt 并跳转游戏内
 */
export function LevelPrepare() {
  const { id } = useParams<{ id: string }>();
  const levelId: number = Number(id);
  const navigate = useNavigate();

  const [level, setLevel] = useState<Level | null>(null);
  const [life, setLife] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState<boolean>(false);

  /** 拉取关卡详情与当前生命值 */
  useEffect(() => {
    const run = async (): Promise<void> => {
      try {
        setLoading(true);
        const [lv, lifeInfo] = await Promise.all([fetchLevel(levelId), fetchLife()]);
        setLevel(lv);
        setLife(lifeInfo.life_count);
        setError(null);
      } catch (e: unknown) {
        setError(getErrorMessage(e, '加载失败'));
      } finally {
        setLoading(false);
      }
    };
    if (Number.isFinite(levelId)) void run();
  }, [levelId]);

  /** 创建本次尝试并跳转游戏内页，通过 state 传递 attemptId */
  const handleStart = useCallback(async (): Promise<void> => {
    try {
      setStarting(true);
      const attempt = await createAttempt(levelId);
      navigate(`/level/${levelId}/play`, { state: { attemptId: attempt.id } });
    } catch (e: unknown) {
      setError(getErrorMessage(e, '开始失败'));
    } finally {
      setStarting(false);
    }
  }, [levelId, navigate]);

  const handleRetry = useCallback((): void => {
    window.location.reload();
  }, []);

  if (loading) return <Loading />;
  if (error || !level) return <ErrorView message={error ?? '关卡不存在'} onRetry={handleRetry} />;

  return (
    <Page showTab={false}>
      <div style={{ padding: 'var(--page-padding) var(--page-padding) 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div className="row" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className="actionPill"
            onClick={() => navigate(-1)}
            style={{ padding: 0, width: '0.84rem', height: '0.84rem', justifyContent: 'center' }}
            aria-label="返回"
          >
            <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}>
              <Icon name="caretRight" size={18} weight="bold" />
            </span>
          </button>
          <div style={{ flex: 1 }} />
        </div>
        <Card style={{ borderRadius: 'var(--radius-card)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ fontSize: 'var(--font-h3)', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Icon name="checklist" size={18} weight="bold" />
              {level.name}
            </div>
            <div style={{ fontSize: 'var(--font-caption)', color: 'var(--color-text-muted)' }}>
              难度 {level.difficulty} ★ · 预计 {level.estimated_seconds ?? '--'}s
            </div>
          </div>
        </Card>

        <div>
          <div className="sectionTitle">奖励</div>
          <Card style={{ borderRadius: 'var(--radius-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
              <Icon name="star" size={16} weight="fill" />
              通关积分 {level.reward_points}
            </div>
          </Card>
        </div>

        <div>
          <div className="sectionTitle">生命</div>
          <Card style={{ borderRadius: 'var(--radius-card)' }}>
            <div style={{ fontSize: 'var(--font-body)' }}>当前生命 {life} / 3</div>
            <div style={{ fontSize: 'var(--font-caption)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>失败扣 1，生命=0 需复活。</div>
          </Card>
        </div>

        <Button full variant={life > 0 ? 'primary' : 'secondary'} disabled={life <= 0 || starting} onClick={handleStart}>
          {life > 0 ? '开始挑战' : '生命不足，去复活'}
        </Button>
        <Button full variant="secondary" onClick={() => navigate(-1)}>
          返回关卡列表
        </Button>
      </div>
    </Page>
  );
}
