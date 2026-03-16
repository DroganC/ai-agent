import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { sendEvents, settleAttempt } from '../../services/attempts';
import { fetchLevel } from '../../services/levels';
import { Page } from '../../components/common/Page';
import { PageHeader } from '../../components/common/PageHeader';
import { Loading } from '../../components/common/Loading';
import { ErrorView } from '../../components/common/ErrorView';
import { useStores } from '../../stores';
import { Icon } from '../../icons';
import { Button } from '../../components/common/Button';
import { renderGame } from '../../components/games';
import type { AttemptEvent, AttemptStatus, PlayRouteState } from '../../types/api';
import type { Level } from '../../types/api';
import { getErrorMessage } from '../../utils/error';
import { Card, Space } from 'antd-mobile';

/** 当前游戏步骤配置（无 game_type 时的默认步骤 demo） */
const steps: ReadonlyArray<{ id: string; title: string }> = [
  { id: 'step1', title: '检查安全帽' },
  { id: 'step2', title: '佩戴护目镜' },
  { id: 'step3', title: '检查设备电源' },
];

/**
 * 游戏内页（玩法页）
 * - 若配置了 game_type，按类型渲染对应玩法（如 link-match/llk 连连看），退出回到准备页
 * - 否则按步骤 demo 流程，从准备页传入 attemptId，完成后上报并跳转结算页
 */
export function LevelPlay() {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  const attemptId: number | undefined = (state as PlayRouteState | null)?.attemptId;
  const navigate = useNavigate();
  const { uiStore } = useStores();

  const [level, setLevel] = useState<Level | null>(null);
  const [levelLoading, setLevelLoading] = useState<boolean>(true);
  const [levelError, setLevelError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [errors, setErrors] = useState<number>(0);
  const [keyErrors, setKeyErrors] = useState<number>(0);
  const [tick, setTick] = useState<number>(0);
  const [startAt] = useState<number>(() => Date.now());

  const levelId = id != null ? Number(id) : NaN;

  /** 拉取游戏（关卡）详情，用于判断 game_type */
  const loadLevel = useCallback(async (): Promise<void> => {
    if (!Number.isFinite(levelId)) {
      setLevelLoading(false);
      return;
    }
    try {
      setLevelLoading(true);
      setLevelError(null);
      const lv = await fetchLevel(levelId);
      setLevel(lv);
    } catch (e: unknown) {
      setLevelError(getErrorMessage(e, '加载游戏失败'));
      setLevel(null);
    } finally {
      setLevelLoading(false);
    }
  }, [levelId]);

  useEffect(() => {
    void loadLevel();
  }, [loadLevel]);

  /** 每秒更新计时 */
  useEffect(() => {
    // 仅在“无 game_type 的步骤 demo 流程”里计时
    if (level?.game_type != null) return;
    if (attemptId == null) return;
    const t = window.setInterval(() => setTick((v) => v + 1), 1000);
    return () => window.clearInterval(t);
  }, [attemptId, level?.game_type]);

  /** 无 game_type 且 attemptId 缺失时，回到准备页（避免在 render 阶段 navigate） */
  useEffect(() => {
    if (levelLoading) return;
    if (levelError != null) return;
    if (level == null) return;
    if (level.game_type != null) return;
    if (attemptId != null) return;
    if (id == null) return;
    navigate(`/level/${id}/prepare`, { replace: true });
  }, [attemptId, id, level, levelError, levelLoading, navigate]);

  /** 记录一次错误（可选关键错误） */
  const handleError = useCallback((isKey = false): void => {
    setErrors((c) => c + 1);
    if (isKey) setKeyErrors((c) => c + 1);
  }, []);

  /** 上报事件并结算，然后跳转结算页 */
  const handleComplete = useCallback(
    async (status: Extract<AttemptStatus, 'passed' | 'failed'>): Promise<void> => {
      if (attemptId == null) return;
      const duration: number = Date.now() - startAt;
      const events: AttemptEvent[] = [{ event_type: 'step_ok', step_id: steps[currentStep].id }];
      try {
        await sendEvents(attemptId, events);
        await settleAttempt(attemptId, {
          status,
          duration_ms: duration,
          score: status === 'passed' ? Math.max(60, 100 - errors * 5 - keyErrors * 20) : 0,
          fail_reason: status === 'failed' ? 'key_error' : undefined,
          error_count: errors,
          key_error_count: keyErrors,
        });
        navigate(`/level/${id}/settlement`, { replace: true, state: { attemptId } });
      } catch (err: unknown) {
        window.alert(getErrorMessage(err, '结算失败，请重试'));
      }
    },
    [attemptId, currentStep, errors, keyErrors, startAt, id, navigate]
  );

  /** 当前步骤选择：错误则记错，正确则下一步或结算 */
  const onStep = useCallback(
    (isCorrect: boolean): void => {
      if (!isCorrect) {
        handleError(false);
        return;
      }
      if (currentStep === steps.length - 1) {
        void handleComplete(keyErrors > 0 ? 'failed' : 'passed');
      } else {
        setCurrentStep((c) => c + 1);
      }
    },
    [currentStep, keyErrors, handleError, handleComplete]
  );

  /** 有 game_type 时使用游戏容器渲染；退出回到准备页 */
  if (!levelLoading && levelError == null && level != null && level.game_type != null) {
    return renderGame(level.game_type, {
      level,
      onExit: () => navigate(`/level/${id}/prepare`, { replace: true }),
    });
  }

  if (levelLoading) return <Loading />;
  if (levelError != null) return <ErrorView message={levelError} onRetry={loadLevel} />;
  if (level == null) return <ErrorView message="游戏不存在" onRetry={loadLevel} />;

  /** 以下为无 game_type 时的步骤 demo 流程，需 attemptId；缺失时回到准备页 */
  if (attemptId == null) {
    return <Loading />;
  }

  return (
    <Page showTab={false}>
      <div style={{ padding: 'var(--page-padding) var(--page-padding) 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <PageHeader title={level.name} onBack={() => navigate(-1)} />
        <Card style={{ borderRadius: 'var(--radius-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Icon name="clock" size={18} weight="bold" />
              <div>
                <div style={{ fontSize: 'var(--font-caption)', color: 'var(--color-text-muted)' }}>模式</div>
                <div style={{ fontWeight: 700 }}>{uiStore.lightMode ? '轻量' : '标准'}</div>
              </div>
            </div>
            <div style={{ fontSize: 'var(--font-caption)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <Icon name="clock" size={16} weight="bold" /> {tick}s
            </div>
          </div>
        </Card>

        <Card style={{ borderRadius: 'var(--radius-card)' }}>
          <div style={{ fontSize: 'var(--font-caption)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>当前步骤</div>
          <div style={{ fontSize: 'var(--font-h2)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Icon name="checklist" size={18} weight="bold" />
            {steps[currentStep].title}
          </div>
        </Card>

        <Space direction="horizontal" block>
          <Button full onClick={() => onStep(true)}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <Icon name="success" size={18} weight="fill" /> 正确完成
            </span>
          </Button>
          <Button full variant="secondary" onClick={() => onStep(false)}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <Icon name="error" size={18} weight="fill" /> 误操作
            </span>
          </Button>
        </Space>

        <Space direction="horizontal" block>
          <Button full variant="secondary" onClick={() => uiStore.toggleLightMode()}>
            {uiStore.lightMode ? '切到标准模式' : '切到轻量模式'}
          </Button>
          <Button full variant="secondary" onClick={() => void handleComplete('failed')}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <Icon name="error" size={16} weight="bold" /> 退出
            </span>
          </Button>
        </Space>

        <div style={{ fontSize: 'var(--font-caption)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Icon name="error" size={14} weight="fill" /> 错误 {errors} · 关键错误 {keyErrors}
        </div>
      </div>
    </Page>
  );
}
