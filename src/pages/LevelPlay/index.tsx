import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { sendEvents, settleAttempt } from '../../services/attempts';
import { Page } from '../../components/common/Page';
import { useStores } from '../../stores';
import { Icon } from '../../icons';
import { Button } from '../../components/common/Button';
import type { AttemptEvent, AttemptStatus, PlayRouteState } from '../../types/api';
import { getErrorMessage } from '../../utils/error';
import { Card, Space } from 'antd-mobile';

/** 当前关卡步骤配置 */
const steps: ReadonlyArray<{ id: string; title: string }> = [
  { id: 'step1', title: '检查安全帽' },
  { id: 'step2', title: '佩戴护目镜' },
  { id: 'step3', title: '检查设备电源' },
];

/**
 * 关卡游戏内页
 * 从准备页传入 attemptId，按步骤选择正确/错误，完成后上报并跳转结算页
 */
export function LevelPlay() {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  const attemptId: number | undefined = (state as PlayRouteState | null)?.attemptId;
  const navigate = useNavigate();
  const { uiStore } = useStores();

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [errors, setErrors] = useState<number>(0);
  const [keyErrors, setKeyErrors] = useState<number>(0);
  const [tick, setTick] = useState<number>(0);
  const [startAt] = useState<number>(() => Date.now());

  /** 无 attemptId 时重定向到准备页（或关卡列表） */
  useEffect(() => {
    if (attemptId == null) {
      if (id) navigate(`/level/${id}/prepare`, { replace: true });
      else navigate('/levels', { replace: true });
    }
  }, [attemptId, id, navigate]);

  /** 每秒更新计时 */
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

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
