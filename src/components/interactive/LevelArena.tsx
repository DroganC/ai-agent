import { useEffect, useMemo, useRef, useState } from "react";
import { LevelStep } from "../../types/domain";

export type InteractionMode = "timing" | "drag" | "sequence";
export type InteractionOutcome = "success" | "fail" | "critical";

type LevelArenaProps = {
  step: LevelStep;
  mode: InteractionMode;
  busy: boolean;
  onResolve: (outcome: InteractionOutcome) => Promise<void>;
};

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
};

const buildSequenceTokens = (title: string) => {
  const chars = Array.from(title.replace(/\s/g, "")).slice(0, 3);
  const fallback = ["识", "确", "执"];
  while (chars.length < 3) {
    chars.push(fallback[chars.length]);
  }
  return chars;
};

export const LevelArena = ({ step, mode, busy, onResolve }: LevelArenaProps) => {
  const [timingPosition, setTimingPosition] = useState(8);
  const timingDirectionRef = useRef<1 | -1>(1);
  const [dragValue, setDragValue] = useState(10);
  const [sequenceProgress, setSequenceProgress] = useState(0);
  const [sequenceHint, setSequenceHint] = useState("按顺序点击下方按钮");
  const [buttonOrder, setButtonOrder] = useState<number[]>([0, 1, 2]);

  const tokens = useMemo(() => buildSequenceTokens(step.title), [step.title]);

  useEffect(() => {
    setTimingPosition(8);
    timingDirectionRef.current = 1;
    setDragValue(10);
    setSequenceProgress(0);
    setSequenceHint("按顺序点击下方按钮");
    setButtonOrder(shuffle([0, 1, 2]));
  }, [step.id, mode]);

  useEffect(() => {
    if (mode !== "timing" || busy) return;
    const timer = window.setInterval(() => {
      setTimingPosition((prev) => {
        let next = prev + timingDirectionRef.current * 2.8;
        if (next >= 98) {
          next = 98;
          timingDirectionRef.current = -1;
        } else if (next <= 2) {
          next = 2;
          timingDirectionRef.current = 1;
        }
        return next;
      });
    }, 32);
    return () => window.clearInterval(timer);
  }, [busy, mode, step.id]);

  const onTimingSubmit = () => {
    const isSafe = timingPosition >= 40 && timingPosition <= 62;
    const isCriticalMiss = timingPosition < 18 || timingPosition > 84;
    void onResolve(isSafe ? "success" : isCriticalMiss ? "critical" : "fail");
  };

  const onDragSubmit = () => {
    if (dragValue >= 78) {
      void onResolve("success");
      return;
    }
    void onResolve(dragValue <= 20 ? "critical" : "fail");
  };

  const onPressSequence = (tokenIndex: number) => {
    if (tokenIndex === sequenceProgress) {
      const next = sequenceProgress + 1;
      setSequenceProgress(next);
      setSequenceHint("节奏不错，继续保持");
      if (next >= tokens.length) {
        void onResolve("success");
      }
      return;
    }
    setSequenceProgress(0);
    setSequenceHint("顺序错误，注意流程先后");
    void onResolve("fail");
  };

  return (
    <div className="arena-card">
      <h4 className="arena-title">{step.title} · 场景互动</h4>
      <p className="arena-sub">{step.description}</p>

      {mode === "timing" ? (
        <>
          <div className="timing-track">
            <div className="timing-warning-zone" />
            <div className="timing-safe-zone" />
            <div className="timing-pointer" style={{ left: `${timingPosition}%` }} />
          </div>
          <button type="button" className="primary-btn block-btn" onClick={onTimingSubmit} disabled={busy}>
            抓准时机执行
          </button>
          <p className="arena-hint">让指针停在绿色区域可获得正确操作。</p>
        </>
      ) : null}

      {mode === "drag" ? (
        <>
          <div className="drag-target">将滑块推到安全区（78% 以上）再提交</div>
          <input
            className="drag-range"
            type="range"
            min={0}
            max={100}
            value={dragValue}
            onChange={(event) => setDragValue(Number(event.target.value))}
            disabled={busy}
          />
          <button type="button" className="primary-btn block-btn" onClick={onDragSubmit} disabled={busy}>
            完成定位（当前 {dragValue}%）
          </button>
        </>
      ) : null}

      {mode === "sequence" ? (
        <>
          <div className="sequence-row">
            {tokens.map((token, index) => {
              const className =
                index < sequenceProgress
                  ? "sequence-pill done"
                  : index === sequenceProgress
                    ? "sequence-pill active"
                    : "sequence-pill";
              return (
                <div key={`${token}-${index}`} className={className}>
                  {token}
                </div>
              );
            })}
          </div>

          <div className="sequence-buttons">
            {buttonOrder.map((index) => (
              <button
                key={index}
                type="button"
                className="sequence-btn"
                disabled={busy}
                onClick={() => onPressSequence(index)}
              >
                {tokens[index]}
              </button>
            ))}
          </div>
          <p className="arena-hint">{sequenceHint}</p>
        </>
      ) : null}
    </div>
  );
};
