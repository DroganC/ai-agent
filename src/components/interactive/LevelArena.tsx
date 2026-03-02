import { useEffect, useMemo, useRef } from "react";
import Phaser from "phaser";
import { LevelStep } from "../../types/domain";

export type InteractionMode = "timing" | "drag" | "sequence";
export type InteractionOutcome = "success" | "fail" | "critical";

type LevelArenaProps = {
  step: LevelStep;
  mode: InteractionMode;
  busy: boolean;
  onResolve: (outcome: InteractionOutcome) => Promise<void>;
};

const ARENA_WIDTH = 336;
const ARENA_HEIGHT = 220;

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

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const LevelArena = ({ step, mode, busy, onResolve }: LevelArenaProps) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const busyRef = useRef(busy);
  const onResolveRef = useRef(onResolve);
  const completedRef = useRef(false);
  const modeRef = useRef(mode);

  const tokens = useMemo(() => buildSequenceTokens(step.title), [step.title]);
  const modeHint = useMemo(() => {
    if (mode === "timing") return "点击按钮锁定时机，指针停在绿色区域即成功。";
    if (mode === "drag") return "拖动控制点进入安全区，完成一次稳定校准。";
    return "按正确流程顺序激活步骤节点，避免流程错序。";
  }, [mode]);

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  useEffect(() => {
    onResolveRef.current = onResolve;
  }, [onResolve]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const parent = mountRef.current;
    if (!parent) return;

    completedRef.current = false;
    gameRef.current?.destroy(true);
    gameRef.current = null;

    const sceneKey = `arena-${step.id}-${mode}-${Date.now()}`;
    let timingDirection: 1 | -1 = 1;
    let timingMarker: Phaser.GameObjects.Rectangle | null = null;

    const resolve = (outcome: InteractionOutcome) => {
      if (completedRef.current || busyRef.current) return;
      completedRef.current = true;
      void onResolveRef.current(outcome);
    };

    const drawCommonHeader = (ctx: Phaser.Scene) => {
      ctx.add.rectangle(ARENA_WIDTH / 2, 16, ARENA_WIDTH - 20, 24, 0x0064ff, 0.1);
      ctx.add.text(14, 8, "Phaser 互动场景", {
        color: "#0053d6",
        fontSize: "12px",
        fontStyle: "700",
      });
    };

    const createActionButton = (
      ctx: Phaser.Scene,
      x: number,
      y: number,
      label: string,
      onTap: () => void,
      color = 0x0064ff,
    ) => {
      const button = ctx.add
        .rectangle(x, y, 124, 36, color, 1)
        .setStrokeStyle(1, 0xffffff, 0.22)
        .setInteractive({ useHandCursor: true });
      ctx.add.text(x, y, label, { color: "#ffffff", fontSize: "13px", fontStyle: "700" }).setOrigin(0.5);
      button.on("pointerdown", () => {
        if (busyRef.current || completedRef.current) return;
        onTap();
      });
      return button;
    };

    class ArenaScene extends Phaser.Scene {
      constructor() {
        super(sceneKey);
      }

      create() {
        this.cameras.main.setBackgroundColor("#f8fbff");
        drawCommonHeader(this);

        if (modeRef.current === "timing") {
          const trackX = 26;
          const trackY = 74;
          const trackW = 284;
          const trackH = 18;

          this.add.rectangle(trackX + trackW / 2, trackY + trackH / 2, trackW, trackH, 0xdbe4f0);
          this.add.rectangle(trackX + trackW * 0.5, trackY + trackH / 2, trackW * 0.52, trackH, 0xffd673, 0.7);
          this.add.rectangle(trackX + trackW * 0.52, trackY + trackH / 2, trackW * 0.22, trackH, 0x22c55e, 0.9);

          timingMarker = this.add.rectangle(trackX + 8, trackY + trackH / 2, 6, 28, 0x0064ff, 1);

          this.add.text(26, 104, "让指针停在绿色区", { fontSize: "12px", color: "#475569" });
          createActionButton(this, ARENA_WIDTH / 2, 168, "锁定时机", () => {
            if (!timingMarker) return;
            const ratio = (timingMarker.x - trackX) / trackW;
            if (ratio >= 0.41 && ratio <= 0.63) {
              resolve("success");
              return;
            }
            resolve(ratio < 0.18 || ratio > 0.86 ? "critical" : "fail");
          });
        }

        if (modeRef.current === "drag") {
          const railStart = 40;
          const railEnd = 296;
          const railY = 92;
          let currentX = railStart + 24;

          this.add.rectangle((railStart + railEnd) / 2, railY, railEnd - railStart, 14, 0xdbe4f0, 1);
          this.add.rectangle(railStart + (railEnd - railStart) * 0.89, railY, 56, 14, 0x22c55e, 0.85);

          const valueText = this.add.text(40, 118, "校准进度：10%", { fontSize: "12px", color: "#475569" });
          const knob = this.add.circle(currentX, railY, 12, 0x0064ff, 1).setInteractive({
            draggable: true,
            useHandCursor: true,
          });

          this.input.setDraggable(knob);
          this.input.on(
            "drag",
            (_pointer: Phaser.Input.Pointer, target: Phaser.GameObjects.GameObject, dragX: number) => {
              if (target !== knob || busyRef.current || completedRef.current) return;
              currentX = clamp(dragX, railStart, railEnd);
              knob.x = currentX;
              const ratio = Math.round(((currentX - railStart) / (railEnd - railStart)) * 100);
              valueText.setText(`校准进度：${ratio}%`);
            },
          );

          createActionButton(this, ARENA_WIDTH / 2, 168, "确认校准", () => {
            const ratio = (currentX - railStart) / (railEnd - railStart);
            if (ratio >= 0.78) {
              resolve("success");
              return;
            }
            resolve(ratio <= 0.2 ? "critical" : "fail");
          });
        }

        if (modeRef.current === "sequence") {
          const order = shuffle(tokens.map((_, index) => index));
          let progress = 0;
          const checkpoints: Phaser.GameObjects.Rectangle[] = [];
          const hintText = this.add.text(20, 182, "按流程顺序激活节点", {
            fontSize: "12px",
            color: "#475569",
          });

          tokens.forEach((token, index) => {
            const x = 84 + index * 84;
            const pill = this.add.rectangle(x, 72, 64, 30, 0xffffff, 1).setStrokeStyle(1, 0xb8d3ff, 1);
            checkpoints.push(pill);
            this.add.text(x, 72, token, { fontSize: "13px", color: "#64748b", fontStyle: "700" }).setOrigin(0.5);
          });

          order.forEach((tokenIndex, idx) => {
            const buttonX = 68 + idx * 100;
            const button = this.add
              .rectangle(buttonX, 132, 86, 34, 0x0064ff, 0.08)
              .setStrokeStyle(1, 0x0064ff, 0.45)
              .setInteractive({ useHandCursor: true });

            this.add
              .text(buttonX, 132, tokens[tokenIndex], {
                fontSize: "16px",
                color: "#0053d6",
                fontStyle: "700",
              })
              .setOrigin(0.5);

            button.on("pointerdown", () => {
              if (busyRef.current || completedRef.current) return;
              if (tokenIndex === progress) {
                checkpoints[progress].setFillStyle(0xd1f2de, 1).setStrokeStyle(1, 0x22c55e, 1);
                progress += 1;
                hintText.setText("节奏很好，继续保持");
                if (progress >= tokens.length) {
                  resolve("success");
                }
                return;
              }
              hintText.setText("流程错序，已判定失败");
              resolve(progress === 0 ? "critical" : "fail");
            });
          });
        }
      }

      update(_time: number, delta: number) {
        if (modeRef.current !== "timing" || !timingMarker || busyRef.current || completedRef.current) return;
        const speed = 0.18 * delta;
        let nextX = timingMarker.x + speed * timingDirection;
        if (nextX >= ARENA_WIDTH - 26) {
          nextX = ARENA_WIDTH - 26;
          timingDirection = -1;
        } else if (nextX <= 26) {
          nextX = 26;
          timingDirection = 1;
        }
        timingMarker.x = nextX;
      }
    }

    const scene = new ArenaScene();

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: ARENA_WIDTH,
      height: ARENA_HEIGHT,
      parent,
      backgroundColor: "#f8fbff",
      scene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: ARENA_WIDTH,
        height: ARENA_HEIGHT,
      },
      render: {
        antialias: true,
      },
    });

    gameRef.current = game;
    return () => {
      game.destroy(true);
      if (gameRef.current === game) {
        gameRef.current = null;
      }
    };
  }, [mode, step.id, tokens]);

  return (
    <div className="arena-card">
      <h4 className="arena-title">{step.title} · Phaser 互动场景</h4>
      <p className="arena-sub">{step.description}</p>
      <div className="phaser-arena-wrap">
        <div ref={mountRef} className="phaser-arena-canvas" />
      </div>
      <p className="arena-hint">{modeHint}</p>
    </div>
  );
};
