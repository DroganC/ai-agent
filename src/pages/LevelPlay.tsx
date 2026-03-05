import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { sendEvents, settleAttempt } from '../services/attempts';
import { Page } from '../components/common/Page';
import { uiStore } from '../store';
import { Icon } from '../icons';
import { Button } from '../components/common/Button';
import type { AttemptEvent, AttemptStatus, PlayRouteState } from '../types/api';
import { getErrorMessage } from '../utils/error';

const steps = [
  { id: 'step1', title: '检查安全帽' },
  { id: 'step2', title: '佩戴护目镜' },
  { id: 'step3', title: '检查设备电源' },
] as const;

export const LevelPlay = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  const attemptId = (state as PlayRouteState | null)?.attemptId;
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState(0);
  const [keyErrors, setKeyErrors] = useState(0);
  const [tick, setTick] = useState(0);
  const startAt = useState(Date.now())[0];

  useEffect(() => {
    // Playing page requires an attempt context created by prepare page.
    if (!attemptId) navigate(`/level/${id}/prepare`, { replace: true });
  }, [attemptId, id, navigate]);

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const handleError = (isKey = false) => {
    setErrors((c) => c + 1);
    if (isKey) setKeyErrors((c) => c + 1);
  };

  const handleComplete = async (status: Extract<AttemptStatus, 'passed' | 'failed'>) => {
    if (!attemptId) return;
    const duration = Date.now() - startAt;
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
    } catch (error: unknown) {
      window.alert(getErrorMessage(error, '结算失败，请重试'));
    }
  };

  const onStep = (isCorrect: boolean) => {
    if (!isCorrect) {
      handleError();
      return;
    }
    if (currentStep === steps.length - 1) {
      handleComplete(keyErrors > 0 ? 'failed' : 'passed');
    } else {
      setCurrentStep((c) => c + 1);
    }
  };

  return (
    <Page showTab={false}>
      <div className="mt-3 space-y-4">
        <div className="card p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Icon name="clock" size={18} weight="bold" className="text-primary" />
            <div>
              <div className="text-xs text-gray-500">模式</div>
              <div className="font-semibold">{uiStore.lightMode ? '轻量' : '标准'}</div>
            </div>
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Icon name="clock" size={16} weight="bold" /> {tick}s
          </div>
        </div>
        <div className="card p-4 shadow-sm">
          <div className="text-xs text-gray-500 mb-2">当前步骤</div>
          <div className="text-lg font-semibold flex items-center gap-2">
            <Icon name="checklist" size={18} weight="bold" className="text-primary" />
            {steps[currentStep].title}
          </div>
        </div>
        <div className="flex gap-3">
          <Button full onClick={() => onStep(true)}>
            <Icon name="success" size={18} weight="fill" /> 正确完成
          </Button>
          <Button full variant="secondary" onClick={() => onStep(false)}>
            <Icon name="error" size={18} weight="fill" className="text-[#c05621]" /> 误操作
          </Button>
        </div>
        <div className="flex gap-3">
          <Button full variant="secondary" onClick={() => uiStore.toggleLightMode()}>
            {uiStore.lightMode ? '切到标准模式' : '切到轻量模式'}
          </Button>
          <Button full variant="secondary" onClick={() => handleComplete('failed')}>
            <Icon name="error" size={16} weight="bold" /> 退出
          </Button>
        </div>
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <Icon name="error" size={14} weight="fill" className="text-[#c05621]" /> 错误 {errors} · 关键错误 {keyErrors}
        </div>
      </div>
    </Page>
  );
};
