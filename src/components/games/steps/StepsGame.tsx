import { useEffect, useMemo, useState } from 'react';
import { Card, Modal, Space, Toast } from 'antd-mobile';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Page } from '../../common/Page';
import { PageHeader } from '../../common/PageHeader';
import { Button } from '../../common/Button';
import { Icon } from '../../../icons';
import type { GameRenderProps } from '../renderGame';
import type { PlayRouteState } from '../../../types/api';
import { settleAttempt } from '../../../services/attempts';

/** 步骤类玩法：单步配置（示例） */
type Step = { id: string; title: string; points: number; isKey?: boolean };

const defaultSteps: Step[] = [
  { id: 'alarm', title: '确认火情并拨打报警电话', points: 20, isKey: true },
  { id: 'extinguisher', title: '选择正确灭火器并拔掉保险销', points: 30, isKey: true },
  { id: 'sweep', title: '对准火焰根部左右扫射', points: 30, isKey: true },
  { id: 'evacuate', title: '组织人员有序撤离并清点人数', points: 20 },
];

/**
 * 步骤类玩法（示例真实游戏组件）
 * - 点击「正确完成」/「错误操作」推进步骤
 * - 最后弹窗展示结算信息，然后触发 onExit 交由页面处理跳转
 */
export default function StepsGame({ level, onExit }: GameRenderProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useLocation();
  const attemptId: number | undefined = (state as PlayRouteState | null)?.attemptId;

  const [stepIdx, setStepIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [errors, setErrors] = useState<number>(0);
  const [keyErrors, setKeyErrors] = useState<number>(0);
  const [elapsed, setElapsed] = useState<number>(0);

  const steps = useMemo(() => defaultSteps, []);
  const current: Step | undefined = steps[stepIdx];

  // 计时：每秒 +1
  useEffect(() => {
    const t = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  const finish = async (): Promise<void> => {
    const base = score;
    const penalty = errors * 5 + keyErrors * 20;
    const timeBonus = Math.max(0, 20 - Math.floor(elapsed / 10));
    const finalScore = Math.max(0, base - penalty + timeBonus);

    if (attemptId != null) {
      try {
        await settleAttempt(attemptId, {
          status: 'passed',
          duration_ms: elapsed * 1000,
          score: finalScore,
          error_count: errors,
          key_error_count: keyErrors,
        });
        if (id != null) {
          navigate(`/level/${id}/pass`, { replace: true, state: { attemptId } });
          return;
        }
      } catch {
        // ignore: 继续走本地弹窗
      }
    }

    await Modal.alert({
      title: '本局结算',
      content: (
        <div style={{ fontSize: 'var(--font-body)', color: 'var(--color-text)', lineHeight: 1.6 }}>
          <div>游戏：{level.name}</div>
          <div>用时：{elapsed} 秒</div>
          <div>误操作：{errors} 次</div>
          <div>关键错误：{keyErrors} 次</div>
          <div style={{ marginTop: 'var(--space-2)', fontWeight: 900, color: 'var(--color-text)' }}>本局积分：{finalScore}</div>
          <div style={{ marginTop: 'var(--space-2)', color: 'var(--color-text-muted)' }}>提示：后续可接入接口把积分上报并进入排行榜。</div>
        </div>
      ),
      confirmText: '返回游戏首页',
    });

    onExit();
  };

  const onAction = (ok: boolean): void => {
    if (!current) return;
    if (ok) {
      setScore((v) => v + current.points);
      if (stepIdx === steps.length - 1) {
        void finish();
      } else {
        setStepIdx((i) => i + 1);
      }
      return;
    }
    setErrors((v) => v + 1);
    if (current.isKey) setKeyErrors((v) => v + 1);
    Toast.show({ content: current.isKey ? '关键步骤错误' : '步骤错误', duration: 900 });
  };

  return (
    <Page showTab={false}>
      <Space direction="vertical" block style={{ padding: 'var(--page-padding) var(--page-padding) 0', gap: 'var(--space-3)' }}>
        <PageHeader
          title={level.name}
          description={`用时 ${elapsed}s · 当前积分 ${score}`}
          onBack={onExit}
        />

        <Card style={{ borderRadius: 'var(--radius-card)' }}>
          <div>
            <div className="subtle">
              当前步骤（{stepIdx + 1}/{steps.length}）
            </div>
            <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-h2)', fontWeight: 900, color: 'var(--color-text)' }}>
              {current?.title}
            </div>
            <div className="subtle" style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-body)' }}>
              完成可得 {current?.points ?? 0} 积分{current?.isKey ? '（关键步骤）' : ''}
            </div>
          </div>
        </Card>

        <Space direction="horizontal" block>
          <Button full onClick={() => onAction(true)}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Icon name="success" size={18} weight="fill" />
              正确完成
            </span>
          </Button>
          <Button full variant="secondary" onClick={() => onAction(false)}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Icon name="error" size={18} weight="fill" />
              错误操作
            </span>
          </Button>
        </Space>

        <div className="subtle" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Icon name="error" size={14} weight="fill" /> 误操作 {errors} 次 · 关键错误 {keyErrors} 次
        </div>
      </Space>
    </Page>
  );
}

