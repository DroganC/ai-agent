import { makeAutoObservable } from "mobx";

type Screen = "intro" | "game" | "result";

type HintTone = "info" | "warn" | "success";

const SORT_ORDER = "提拔握压";

class GameStore {
  screen: Screen = "intro";
  stageIndex = 0;
  hint = { tone: "info" as HintTone, text: "准备开始学习灭火器的正确使用方法。" };

  // Stage 1 - sort
  steps = ["提", "拔", "握", "压"] as const;
  placed: string[] = [];
  draggingId: string | null = null;
  dragPos = { x: 0, y: 0 };
  activeSlot: number | null = null;
  bounceId: string | null = null;
  snapId: string | null = null;
  private bounceTimer: number | null = null;
  private snapTimer: number | null = null;

  // Stage 2 - pressure
  selection: "low" | "normal" | "high" | null = null;
  pointerSet = false;
  value = "0.0 MPa";
  pulse = false;
  private jitterTimer: number | null = null;

  // Stage 3 - spray
  spraying = false;
  private sprayTimer: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setHint(tone: HintTone, text: string) {
    this.hint = { tone, text };
  }

  startGame() {
    this.screen = "game";
  }

  resetGame() {
    this.screen = "intro";
    this.stageIndex = 0;
    this.setHint("info", "准备开始学习灭火器的正确使用方法。");
    this.resetStageStates();
  }

  goNextStage() {
    this.setHint("success", "做得好！继续下一步。");
    window.setTimeout(() => {
      if (this.stageIndex >= 2) {
        this.screen = "result";
        this.stageIndex = 2;
      } else {
        this.stageIndex += 1;
      }
    }, 500);
  }

  // Stage 1 logic
  startDrag(id: string, x: number, y: number) {
    this.draggingId = id;
    this.dragPos = { x, y };
  }

  updateDrag(x: number, y: number, activeSlot: number | null) {
    if (!this.draggingId) return;
    this.dragPos = { x, y };
    this.activeSlot = activeSlot;
  }

  endDrag(inside: boolean, index: number | null) {
    if (!this.draggingId) return;
    const id = this.draggingId;
    this.draggingId = null;
    this.activeSlot = null;

    if (!inside || index === null) {
      this.setBounce(id);
      return;
    }

    const without = this.placed.filter((item) => item !== id);
    const next = [...without];
    next.splice(index, 0, id);
    this.placed = next.slice(0, 4);
    this.setSnap(id);

    if (this.placed.length === 4) {
      const correct = this.placed.join("") === SORT_ORDER;
      if (correct) {
        this.setHint("success", "排序正确，提拔握压记住啦！");
        window.setTimeout(() => this.goNextStage(), 500);
      } else {
        this.setHint("warn", "顺序有误，可拖拽卡片重新排序。");
      }
    }
  }

  private setBounce(id: string) {
    if (this.bounceTimer) window.clearTimeout(this.bounceTimer);
    this.bounceId = id;
    this.bounceTimer = window.setTimeout(() => {
      this.bounceId = null;
    }, 300);
  }

  private setSnap(id: string) {
    if (this.snapTimer) window.clearTimeout(this.snapTimer);
    this.snapId = id;
    this.snapTimer = window.setTimeout(() => {
      this.snapId = null;
    }, 250);
  }

  // Stage 2 logic
  selectPressure(level: "low" | "normal" | "high") {
    this.clearJitter();
    this.selection = level;
    this.pointerSet = false;
    this.setHint("info", "点击转盘，让指针停在对应压力区域。");
  }

  confirmPressure() {
    if (!this.selection) {
      this.setHint("warn", "请先选择压力档位。");
      return;
    }
    this.pointerSet = true;
    const base = this.basePressure(this.selection);
    this.value = `${base.toFixed(1)} MPa`;
    this.pulse = true;
    window.setTimeout(() => {
      this.pulse = false;
    }, 180);

    if (this.selection === "normal") {
      this.setHint("success", "压力正常，进入下一关！");
      window.setTimeout(() => this.goNextStage(), 500);
    } else {
      this.setHint("warn", "压力不在正常范围，请重新选择。");
    }
  }

  startPressureJitter() {
    if (!this.pointerSet || !this.selection) return;
    this.clearJitter();
    const base = this.basePressure(this.selection);
    const start = Date.now();
    this.jitterTimer = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const offset = (Math.random() - 0.5) * 0.08;
      this.value = `${(base + offset).toFixed(2)} MPa`;
      if (elapsed > 800) {
        this.clearJitter();
        this.value = `${base.toFixed(1)} MPa`;
      }
    }, 120);
  }

  private basePressure(level: "low" | "normal" | "high") {
    if (level === "low") return 0.4;
    if (level === "normal") return 1.1;
    return 1.8;
  }

  private clearJitter() {
    if (this.jitterTimer) {
      window.clearInterval(this.jitterTimer);
      this.jitterTimer = null;
    }
  }

  // Stage 3 logic
  startSpray() {
    if (this.spraying) return;
    this.spraying = true;
    this.setHint("info", "开始喷射灭火！");
    if (this.sprayTimer) window.clearTimeout(this.sprayTimer);
    this.sprayTimer = window.setTimeout(() => {
      this.setHint("success", "喷射完成，通关！");
      this.spraying = false;
      this.screen = "result";
    }, 2000);
  }

  private resetStageStates() {
    this.placed = [];
    this.draggingId = null;
    this.activeSlot = null;
    this.bounceId = null;
    this.snapId = null;
    this.selection = null;
    this.pointerSet = false;
    this.value = "0.0 MPa";
    this.pulse = false;
    this.spraying = false;
    this.clearJitter();
    if (this.sprayTimer) window.clearTimeout(this.sprayTimer);
  }
}

const gameStore = new GameStore();

export type { Screen };
export { gameStore };
