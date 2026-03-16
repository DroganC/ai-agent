import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchLevel } from '../../services/levels';
import { fetchLife } from '../../services/life';
import { createAttempt } from '../../services/attempts';
import type { Level } from '../../types/api';
import { Page } from '../../components/common/Page';
import { PageHeader } from '../../components/common/PageHeader';
import { Loading } from '../../components/common/Loading';
import { ErrorView } from '../../components/common/ErrorView';
import { PullToRefreshContainer } from '../../components/common/PullToRefreshContainer';
import { Icon } from '../../icons';
import { Button } from '../../components/common/Button';
import { getErrorMessage } from '../../utils/error';

/**
 * 游戏首页（关卡准备页）
 * 全站唯一的游戏介绍/准备页，路由：/level/:id/prepare；旧路径 /game/:gameId 会重定向到此路由。
 * 遵循全站 UI 规范：Page、sectionTitle 外置、sectionCard、底部吸底双按钮。
 * 展示关卡名称、说明、知识技巧、生命值与奖励，提供「返回列表」「开始挑战」入口。
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
  const load = useCallback(async (): Promise<void> => {
    if (!Number.isFinite(levelId)) {
      setLoading(false);
      setError('无效的关卡 ID');
      return;
    }
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
  }, [levelId]);

  useEffect(() => {
    void load();
  }, [load]);

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

  if (loading) return <Loading />;
  if (error || !level) return <ErrorView message={error ?? '关卡不存在'} onRetry={load} />;

  return (
    <Page showTab={false}>
      <div className="game-intro">
        <PullToRefreshContainer onRefresh={load}>
          <div className="game-intro__scroll">
            <PageHeader
              title={level.name}
              description={`难度 ${level.difficulty} ★ · 预计 ${level.estimated_seconds ?? '--'}s · 奖励 ${level.reward_points} 积分`}
              onBack={() => navigate(-1)}
            />

            <div className="game-intro__block">
              <div className="sectionTitle">说明</div>
              <div className="sectionCard game-intro__card">
                <div className="subtle game-intro__card-text">
                  · 按照提示完成关键步骤，减少误操作与关键错误。<br />
                  · 系统将根据完成情况与用时计算本局积分，并用于排行榜排序。
                </div>
              </div>
            </div>

            <div className="game-intro__block">
              <div className="sectionTitle">知识技巧</div>
              <div className="sectionCard game-intro__card">
                <div className="subtle game-intro__card-text">
                  · 操作前先看清题目与选项，避免误触。<br />
                  · 关键步骤错误会扣分，建议先想后做。<br />
                  · 用时越短可获得时间加成，但不要为求快而出错。
                </div>
              </div>
            </div>

            <div className="game-intro__block">
              <div className="sectionTitle">生命值和奖励</div>
              <div className="sectionCard game-intro__card">
                <div className="game-intro__meta">
                  <span style={{ fontSize: 'var(--font-body)' }}>当前生命 {life} / 3</span>
                  <span className="subtle">失败扣 1，生命=0 需复活</span>
                </div>
                <div className="game-intro__meta" style={{ marginTop: 'var(--space-3)' }}>
                  <div className="row" style={{ justifyContent: 'flex-start', gap: 'var(--space-2)', color: 'var(--color-text-muted)', fontSize: 'var(--font-body)' }}>
                    <Icon name="star" size={16} weight="fill" />
                    通关积分 {level.reward_points}
                  </div>
                </div>
              </div>
            </div>

            <div className="game-intro__spacer" />
          </div>
        </PullToRefreshContainer>

        <div className="game-intro__bottom">
          <div className="game-intro__btn-wrap">
            <Button variant="secondary" full onClick={() => navigate(-1)}>
              返回列表
            </Button>
          </div>
          <div className="game-intro__btn-wrap">
            <Button
              full
              variant={life > 0 ? 'primary' : 'secondary'}
              disabled={life <= 0 || starting}
              onClick={handleStart}
            >
              {life > 0 ? '开始挑战' : '生命不足'}
            </Button>
          </div>
        </div>
      </div>
    </Page>
  );
}
