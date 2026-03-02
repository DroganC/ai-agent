import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { buildInitialState, mockUser } from "../data/mockData";
import {
  AppState,
  AttemptStatus,
  LeaderboardEntry,
  Level,
  LevelAttempt,
  ReceiverInfo,
  ReviveType,
  UserComputedStats,
  UserLevelProgress,
} from "../types/domain";
import { clamp, delay, nowIso, todayKey, uid } from "../utils/helpers";
import { clearState, loadState, saveState } from "../utils/storage";

type FinishAttemptPayload = {
  attemptId: string;
  status: AttemptStatus;
  score: number;
  failReason?: "timeout" | "key_error" | "manual_abort" | "other";
};

type StepEventPayload = {
  attemptId: string;
  stepId: string;
  knowledgePoint: string;
  optionId: string;
};

type StepEventResult = {
  isCorrect: boolean;
  isKeyError: boolean;
  tip: string;
  penalty: number;
};

interface AppActions {
  loginByCome: (code: string) => Promise<void>;
  logout: () => void;
  switchScene: (sceneId: number) => void;
  startAttempt: (levelId: number) => Promise<string>;
  submitStepEvent: (payload: StepEventPayload) => Promise<StepEventResult>;
  finishAttempt: (payload: FinishAttemptPayload) => Promise<LevelAttempt>;
  markReviewCompleted: (attemptId: string) => void;
  completeLearning: (materialId: number) => Promise<void>;
  revive: (type: ReviveType) => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  redeemItem: (itemId: number, receiverInfo?: ReceiverInfo) => Promise<string>;
  resetDemoData: () => void;
}

interface AppContextValue {
  state: AppState;
  stats: UserComputedStats;
  leaderboard: LeaderboardEntry[];
  myRank: number;
  actions: AppActions;
}

const STORAGE_SAFE_FALLBACK = buildInitialState();

const AppContext = createContext<AppContextValue | null>(null);

// 汇总员工能力指标：总分、累计最佳用时、通关数量等。
const computeStats = (state: AppState): UserComputedStats => {
  const progressList = Object.values(state.progressByLevel);
  const passed = progressList.filter((item) => item.passCount > 0);
  const totalScore = passed.reduce((sum, item) => sum + item.bestScore, 0);
  const durationList = passed
    .map((item) => item.bestDurationMs)
    .filter((item): item is number => typeof item === "number" && item > 0);
  const bestDurationMs = durationList.length ? durationList.reduce((sum, cur) => sum + cur, 0) : Number.MAX_SAFE_INTEGER;
  const passLevelCount = passed.length;
  const unlockedLevelCount = progressList.filter((item) => item.unlockStatus === 1).length;
  const latestAttempt = state.attemptOrder[state.attemptOrder.length - 1];

  return {
    totalScore,
    bestDurationMs,
    passLevelCount,
    unlockedLevelCount,
    lastAttemptId: latestAttempt,
  };
};

const buildLeaderboard = (state: AppState): LeaderboardEntry[] => {
  const stats = computeStats(state);
  const peers = [...state.leaderboardPeers];

  if (state.currentUser) {
    peers.push({
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      departmentName: state.currentUser.departmentName,
      baseName: state.currentUser.baseName,
      totalScore: stats.totalScore,
      bestDurationMs: stats.bestDurationMs,
      achievedAt: nowIso(),
    });
  }

  return peers.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (a.bestDurationMs !== b.bestDurationMs) return a.bestDurationMs - b.bestDurationMs;
    return new Date(a.achievedAt).getTime() - new Date(b.achievedAt).getTime();
  });
};

const applyDailyReset = (state: AppState): AppState => {
  const today = todayKey();
  const needLifeReset = state.lifeAccount.dailyResetDate !== today;
  const needCounterReset = state.reviveCounter.date !== today;
  const needTaskReset = state.reviveTasks.date !== today;

  if (!needLifeReset && !needCounterReset && !needTaskReset) {
    return state;
  }

  const next = { ...state };
  if (needLifeReset) {
    next.lifeAccount = {
      ...next.lifeAccount,
      lifeCount: 3,
      dailyResetDate: today,
      updatedAt: nowIso(),
    };
    next.lifeFlows = [
      {
        id: uid("lf"),
        userId: next.lifeAccount.userId,
        change: 3,
        reason: "reset" as const,
        refType: "system" as const,
        refId: today,
        createdAt: nowIso(),
      },
      ...next.lifeFlows,
    ].slice(0, 200);
  }

  if (needCounterReset) {
    next.reviveCounter = {
      ...next.reviveCounter,
      date: today,
      reviveCount: 0,
      updatedAt: nowIso(),
    };
  }

  if (needTaskReset) {
    next.reviveTasks = {
      date: today,
      learningCompleted: false,
      reviewCompleted: false,
      claimedTaskIds: [],
    };
  }
  return next;
};

const ensureProgressExists = (state: AppState, levelId: number): UserLevelProgress => {
  const progress = state.progressByLevel[levelId];
  if (!progress) {
    throw new Error("关卡进度不存在");
  }
  return progress;
};

const getLevelOrThrow = (state: AppState, levelId: number): Level => {
  const level = state.levels.find((item) => item.id === levelId);
  if (!level) {
    throw new Error("关卡不存在或已下架");
  }
  return level;
};

const getAttemptOrThrow = (state: AppState, attemptId: string): LevelAttempt => {
  const attempt = state.attemptsById[attemptId];
  if (!attempt) {
    throw new Error("挑战记录不存在");
  }
  return attempt;
};

const countTodayPassOfLevel = (state: AppState, levelId: number) => {
  const today = todayKey();
  return Object.values(state.attemptsById).filter(
    (item) => item.levelId === levelId && item.status === "passed" && item.endAt?.startsWith(today),
  ).length;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(() => {
    const loaded = loadState();
    return loaded ?? STORAGE_SAFE_FALLBACK;
  });

  const stateRef = useRef(state);

  useEffect(() => {
    setState((prev) => applyDailyReset(prev));
  }, []);

  useEffect(() => {
    stateRef.current = state;
    saveState(state);
  }, [state]);

  const patchState = (updater: (prev: AppState) => AppState) => {
    const base = applyDailyReset(stateRef.current);
    const next = updater(base);
    stateRef.current = next;
    setState(next);
  };

  const actions: AppActions = useMemo(
    () => ({
      async loginByCome(code: string) {
        await delay();
        if (!code || code === "fail") {
          throw new Error("认证服务异常，请稍后重试");
        }

        patchState((prev) => ({
          ...prev,
          sessionToken: uid("token"),
          currentUser: mockUser,
          analyticsEvents: [
            {
              id: uid("evt"),
              event: "login_success",
              ts: nowIso(),
              payload: { from: "come_callback" },
            },
            ...prev.analyticsEvents,
          ].slice(0, 200),
        }));
      },
      logout() {
        patchState((prev) => ({
          ...prev,
          sessionToken: null,
          currentUser: null,
        }));
      },
      switchScene(sceneId: number) {
        patchState((prev) => ({
          ...prev,
          selectedSceneId: sceneId,
          analyticsEvents: [
            {
              id: uid("evt"),
              event: "scene_switch",
              ts: nowIso(),
              payload: { sceneId },
            },
            ...prev.analyticsEvents,
          ].slice(0, 200),
        }));
      },
      async startAttempt(levelId: number) {
        await delay(180);
        let attemptId = "";
        patchState((prev) => {
          if (!prev.currentUser || !prev.sessionToken) {
            throw new Error("登录已失效，请重新登录");
          }
          if (prev.lifeAccount.lifeCount <= 0) {
            throw new Error("生命值不足，无法开始挑战");
          }
          const progress = ensureProgressExists(prev, levelId);
          if (progress.unlockStatus !== 1) {
            throw new Error("关卡未解锁，请先完成前置关卡");
          }
          const level = getLevelOrThrow(prev, levelId);
          attemptId = uid("att");
          const attempt: LevelAttempt = {
            id: attemptId,
            userId: prev.currentUser.id,
            levelId,
            status: "in_progress",
            startAt: nowIso(),
            errorCount: 0,
            keyErrorCount: 0,
            clientMode: "normal",
            contentVersion: level.contentVersion,
            events: [
              {
                id: uid("evt"),
                attemptId,
                eventType: "attempt_start",
                isKeyError: false,
                ts: nowIso(),
                message: "挑战开始",
              },
            ],
          };

          return {
            ...prev,
            attemptsById: {
              ...prev.attemptsById,
              [attemptId]: attempt,
            },
            attemptOrder: [...prev.attemptOrder, attemptId],
            progressByLevel: {
              ...prev.progressByLevel,
              [levelId]: {
                ...progress,
                lastAttemptId: attemptId,
                updatedAt: nowIso(),
              },
            },
            analyticsEvents: [
              {
                id: uid("evt"),
                event: "attempt_start",
                ts: nowIso(),
                payload: { levelId, attemptId },
              },
              ...prev.analyticsEvents,
            ].slice(0, 200),
          };
        });
        return attemptId;
      },
      async submitStepEvent(payload: StepEventPayload) {
        await delay(120);
        let result: StepEventResult | null = null;

        patchState((prev) => {
          const attempt = getAttemptOrThrow(prev, payload.attemptId);
          if (attempt.status !== "in_progress") {
            throw new Error("挑战已结束，不能继续操作");
          }
          const level = getLevelOrThrow(prev, attempt.levelId);
          const step = level.steps.find((item) => item.id === payload.stepId);
          if (!step) {
            throw new Error("步骤不存在");
          }
          const option = step.options.find((item) => item.id === payload.optionId);
          if (!option) {
            throw new Error("操作选项不存在");
          }

          const isCorrect = option.isCorrect;
          const isKeyError = !isCorrect && Boolean(option.isKeyError);
          const penalty =
            !isCorrect && option.errorType ? level.passRule.nonKeyPenalty[option.errorType] : 0;
          result = {
            isCorrect,
            isKeyError,
            tip: option.tip,
            penalty,
          };

          const updatedAttempt: LevelAttempt = {
            ...attempt,
            errorCount: isCorrect ? attempt.errorCount : attempt.errorCount + 1,
            keyErrorCount: isKeyError ? attempt.keyErrorCount + 1 : attempt.keyErrorCount,
            events: [
              ...attempt.events,
              {
                id: uid("evt"),
                attemptId: attempt.id,
                eventType: isCorrect ? "step_ok" : "step_error",
                stepId: step.id,
                knowledgePoint: payload.knowledgePoint,
                errorType: option.errorType,
                isKeyError,
                ts: nowIso(),
                message: option.tip,
              },
            ],
          };

          return {
            ...prev,
            attemptsById: {
              ...prev.attemptsById,
              [attempt.id]: updatedAttempt,
            },
          };
        });

        if (!result) {
          throw new Error("事件上报失败");
        }
        return result;
      },
      async finishAttempt(payload: FinishAttemptPayload) {
        await delay(150);
        let settledAttempt: LevelAttempt | null = null;

        patchState((prev) => {
          // attempt 结算状态机：in_progress -> passed/failed/aborted
          const attempt = getAttemptOrThrow(prev, payload.attemptId);
          if (attempt.status !== "in_progress") {
            settledAttempt = attempt;
            return prev;
          }
          const level = getLevelOrThrow(prev, attempt.levelId);
          const progress = ensureProgressExists(prev, level.id);
          const now = nowIso();
          const durationMs = new Date(now).getTime() - new Date(attempt.startAt).getTime();
          const normalizedScore = clamp(Math.round(payload.score), 0, 100);

          let finalStatus = payload.status;
          let failReason = payload.failReason;
          if (finalStatus === "passed") {
            if (durationMs > level.passRule.timeoutMs) {
              finalStatus = "failed";
              failReason = "timeout";
            } else if (normalizedScore < level.passRule.minScore) {
              finalStatus = "failed";
              failReason = "other";
            }
          }

          const nextAttempt: LevelAttempt = {
            ...attempt,
            status: finalStatus,
            endAt: now,
            durationMs,
            score: normalizedScore,
            failReason,
            events: [
              ...attempt.events,
              {
                id: uid("evt"),
                attemptId: attempt.id,
                eventType: "attempt_finish",
                isKeyError: false,
                ts: now,
                message:
                  finalStatus === "passed"
                    ? "挑战通关"
                    : finalStatus === "aborted"
                      ? "挑战中止"
                      : "挑战失败",
              },
            ],
          };
          settledAttempt = nextAttempt;

          let nextProgress: UserLevelProgress = {
            ...progress,
            lastAttemptId: nextAttempt.id,
            updatedAt: now,
          };
          if (finalStatus === "passed") {
            nextProgress = {
              ...nextProgress,
              passCount: progress.passCount + 1,
              bestScore: Math.max(progress.bestScore, normalizedScore),
              bestDurationMs:
                typeof progress.bestDurationMs === "number"
                  ? Math.min(progress.bestDurationMs, durationMs)
                  : durationMs,
              reachedAt: now,
            };
          }

          const nextProgressByLevel = {
            ...prev.progressByLevel,
            [level.id]: nextProgress,
          };

          if (finalStatus === "passed") {
            prev.levels
              .filter((item) => item.unlockPrevLevelId === level.id)
              .forEach((nextLevel) => {
                const existing = ensureProgressExists(prev, nextLevel.id);
                nextProgressByLevel[nextLevel.id] = {
                  ...existing,
                  unlockStatus: 1,
                  updatedAt: now,
                };
              });
          }

          let nextLife = prev.lifeAccount;
          let nextLifeFlows = prev.lifeFlows;
          if (finalStatus === "failed") {
            const changed = Math.max(prev.lifeAccount.lifeCount - 1, 0);
            nextLife = {
              ...prev.lifeAccount,
              lifeCount: changed,
              updatedAt: now,
            };
            nextLifeFlows = [
              {
                id: uid("lf"),
                userId: prev.lifeAccount.userId,
                change: -1,
                reason: "fail" as const,
                refType: "attempt" as const,
                refId: attempt.id,
                createdAt: now,
              },
              ...prev.lifeFlows,
            ].slice(0, 200);
          }

          let nextPointAccount = prev.pointAccount;
          let nextPointFlows = prev.pointFlows;
          if (finalStatus === "passed") {
            const todayPass = countTodayPassOfLevel(prev, level.id);
            if (todayPass < 2) {
              const bonus = progress.passCount === 0 ? 10 : 0;
              const reward = level.rewardPoints + bonus;
              const balance = prev.pointAccount.balance + reward;
              nextPointAccount = {
                ...prev.pointAccount,
                balance,
                updatedAt: now,
              };
              nextPointFlows = [
                {
                  id: uid("pf"),
                  userId: prev.pointAccount.userId,
                  change: reward,
                  balanceAfter: balance,
                  reason: progress.passCount === 0 ? ("first_pass" as const) : ("level_pass" as const),
                  refType: "attempt" as const,
                  refId: attempt.id,
                  createdAt: now,
                },
                ...prev.pointFlows,
              ].slice(0, 300);
            }
          }

          return {
            ...prev,
            attemptsById: {
              ...prev.attemptsById,
              [attempt.id]: nextAttempt,
            },
            progressByLevel: nextProgressByLevel,
            lifeAccount: nextLife,
            lifeFlows: nextLifeFlows,
            pointAccount: nextPointAccount,
            pointFlows: nextPointFlows,
            analyticsEvents: [
              {
                id: uid("evt"),
                event: "attempt_finish",
                ts: now,
                payload: {
                  attemptId: attempt.id,
                  levelId: level.id,
                  status: finalStatus,
                  score: normalizedScore,
                },
              },
              ...prev.analyticsEvents,
            ].slice(0, 200),
          };
        });

        if (!settledAttempt) {
          throw new Error("结算失败，请重试");
        }
        return settledAttempt;
      },
      markReviewCompleted(attemptId: string) {
        patchState((prev) => ({
          ...prev,
          reviveTasks: {
            ...prev.reviveTasks,
            reviewCompleted: true,
          },
          analyticsEvents: [
            {
              id: uid("evt"),
              event: "attempt_review_view",
              ts: nowIso(),
              payload: { attemptId },
            },
            ...prev.analyticsEvents,
          ].slice(0, 200),
        }));
      },
      async completeLearning(materialId: number) {
        await delay(150);
        patchState((prev) => {
          if (!prev.currentUser) {
            throw new Error("请先登录");
          }
          const material = prev.learningMaterials.find((item) => item.id === materialId);
          if (!material || material.status !== 1) {
            throw new Error("资料已下架");
          }

          const existing = prev.learningRecords.find(
            (item) => item.materialId === materialId && item.userId === prev.currentUser?.id && item.status === "completed",
          );
          let nextPointAccount = prev.pointAccount;
          let nextPointFlows = prev.pointFlows;
          if (!existing) {
            const nextBalance = prev.pointAccount.balance + 10;
            nextPointAccount = {
              ...prev.pointAccount,
              balance: nextBalance,
              updatedAt: nowIso(),
            };
            nextPointFlows = [
              {
                id: uid("pf"),
                userId: prev.pointAccount.userId,
                change: 10,
                balanceAfter: nextBalance,
                reason: "learning_complete" as const,
                refType: "material" as const,
                refId: `${materialId}`,
                createdAt: nowIso(),
              },
              ...prev.pointFlows,
            ].slice(0, 300);
          }

          return {
            ...prev,
            reviveTasks: {
              ...prev.reviveTasks,
              learningCompleted: true,
            },
            learningRecords: [
              {
                id: uid("lr"),
                userId: prev.currentUser.id,
                materialId,
                status: "completed",
                durationMs: 8 * 60 * 1000,
                createdAt: nowIso(),
                updatedAt: nowIso(),
              },
              ...prev.learningRecords.filter(
                (item) => !(item.materialId === materialId && item.userId === prev.currentUser?.id),
              ),
            ],
            pointAccount: nextPointAccount,
            pointFlows: nextPointFlows,
            analyticsEvents: [
              {
                id: uid("evt"),
                event: "learning_complete",
                ts: nowIso(),
                payload: { materialId },
              },
              ...prev.analyticsEvents,
            ].slice(0, 200),
          };
        });
      },
      async revive(type: ReviveType) {
        await delay(120);
        patchState((prev) => {
          if (prev.lifeAccount.lifeCount > 0) {
            throw new Error("当前生命值充足，无需复活");
          }
          if (prev.reviveCounter.reviveCount >= prev.reviveCounter.maxPerDay) {
            throw new Error("今日复活次数已达上限");
          }
          const now = nowIso();
          const nextCounter = {
            ...prev.reviveCounter,
            reviveCount: prev.reviveCounter.reviveCount + 1,
            updatedAt: now,
          };

          let nextPoints = prev.pointAccount;
          let nextFlows = prev.pointFlows;
          let nextTasks = prev.reviveTasks;

          if (type === "points") {
            const reviveCost = 60;
            if (prev.pointAccount.balance < reviveCost) {
              throw new Error("积分不足，无法积分复活");
            }
            const balance = prev.pointAccount.balance - reviveCost;
            nextPoints = {
              ...prev.pointAccount,
              balance,
              updatedAt: now,
            };
            nextFlows = [
              {
                id: uid("pf"),
                userId: prev.pointAccount.userId,
                change: -reviveCost,
                balanceAfter: balance,
                reason: "revive" as const,
                refType: "revive" as const,
                refId: `points-${now}`,
                createdAt: now,
              },
              ...prev.pointFlows,
            ].slice(0, 300);
          } else {
            const taskCandidates: Array<{ taskId: string; completed: boolean }> = [
              { taskId: "learning", completed: prev.reviveTasks.learningCompleted },
              { taskId: "review", completed: prev.reviveTasks.reviewCompleted },
            ];
            const usable = taskCandidates.find(
              (item) => item.completed && !prev.reviveTasks.claimedTaskIds.includes(item.taskId),
            );
            if (!usable) {
              throw new Error("暂无可用任务复活，请先完成任务");
            }
            nextTasks = {
              ...prev.reviveTasks,
              claimedTaskIds: [...prev.reviveTasks.claimedTaskIds, usable.taskId],
            };
          }

          return {
            ...prev,
            pointAccount: nextPoints,
            pointFlows: nextFlows,
            reviveTasks: nextTasks,
            reviveCounter: nextCounter,
            lifeAccount: {
              ...prev.lifeAccount,
              lifeCount: 1,
              updatedAt: now,
            },
            lifeFlows: [
              {
                id: uid("lf"),
                userId: prev.lifeAccount.userId,
                change: 1,
                reason: type === "task" ? ("task" as const) : ("revive" as const),
                refType: "revive" as const,
                refId: `${type}-${now}`,
                createdAt: now,
              },
              ...prev.lifeFlows,
            ].slice(0, 200),
            analyticsEvents: [
              {
                id: uid("evt"),
                event: "revive_success",
                ts: now,
                payload: { type },
              },
              ...prev.analyticsEvents,
            ].slice(0, 200),
          };
        });
      },
      async refreshLeaderboard() {
        await delay();
        patchState((prev) => ({
          ...prev,
          lastLeaderboardRefreshAt: nowIso(),
          analyticsEvents: [
            {
              id: uid("evt"),
              event: "leaderboard_refresh",
              ts: nowIso(),
              payload: { sceneId: prev.selectedSceneId },
            },
            ...prev.analyticsEvents,
          ].slice(0, 200),
        }));
      },
      async redeemItem(itemId: number, receiverInfo?: ReceiverInfo) {
        await delay(180);
        let createdOrderId = "";

        patchState((prev) => {
          if (!prev.currentUser) {
            throw new Error("请先登录");
          }
          const item = prev.shopItems.find((it) => it.id === itemId && it.status === 1);
          if (!item) {
            throw new Error("商品已下架");
          }
          if (item.stock <= 0) {
            throw new Error("库存不足（409）");
          }

          const today = todayKey();
          const todayCount = prev.shopOrders.filter(
            (order) =>
              order.itemId === itemId &&
              order.createdAt.startsWith(today) &&
              order.status !== "cancelled" &&
              order.status !== "refunded",
          ).length;
          if (todayCount >= item.limitPerDay) {
            throw new Error("今日已达到该商品限购次数");
          }
          if (prev.pointAccount.balance < item.costPoints) {
            throw new Error("积分不足，无法兑换");
          }

          if (item.type === "physical") {
            if (!receiverInfo || !receiverInfo.receiverName || !receiverInfo.phone || !receiverInfo.address) {
              throw new Error("实物兑换需填写完整收货信息");
            }
          }

          const now = nowIso();
          createdOrderId = uid("ord");
          const orderStatus = item.type === "virtual" ? "fulfilled" : "paid";
          const updatedItem = {
            ...item,
            stock: item.stock - 1,
          };
          const balanceAfter = prev.pointAccount.balance - item.costPoints;

          return {
            ...prev,
            shopItems: prev.shopItems.map((it) => (it.id === item.id ? updatedItem : it)),
            pointAccount: {
              ...prev.pointAccount,
              balance: balanceAfter,
              updatedAt: now,
            },
            pointFlows: [
              {
                id: uid("pf"),
                userId: prev.pointAccount.userId,
                change: -item.costPoints,
                balanceAfter,
                reason: "redeem" as const,
                refType: "store_order" as const,
                refId: createdOrderId,
                createdAt: now,
              },
              ...prev.pointFlows,
            ].slice(0, 300),
            shopOrders: [
              {
                id: createdOrderId,
                userId: prev.currentUser.id,
                itemId: item.id,
                status: orderStatus,
                costPoints: item.costPoints,
                receiverInfo: item.type === "physical" ? receiverInfo : undefined,
                fulfillInfo: item.type === "virtual" ? "已自动发放到企业福利账户" : "待仓储履约发货",
                createdAt: now,
                updatedAt: now,
              },
              ...prev.shopOrders,
            ],
            analyticsEvents: [
              {
                id: uid("evt"),
                event: "store_redeem_success",
                ts: now,
                payload: { itemId: item.id, orderId: createdOrderId },
              },
              ...prev.analyticsEvents,
            ].slice(0, 200),
          };
        });

        if (!createdOrderId) {
          throw new Error("兑换失败，请重试");
        }
        return createdOrderId;
      },
      resetDemoData() {
        clearState();
        setState(buildInitialState());
      },
    }),
    [],
  );

  const stats = useMemo(() => computeStats(state), [state]);
  const leaderboard = useMemo(() => buildLeaderboard(state), [state, state.lastLeaderboardRefreshAt]);
  const myRank = useMemo(() => {
    if (!state.currentUser) return -1;
    return leaderboard.findIndex((item) => item.userId === state.currentUser?.id) + 1;
  }, [leaderboard, state.currentUser]);

  const value = useMemo(
    () => ({
      state,
      stats,
      leaderboard,
      myRank,
      actions,
    }),
    [actions, leaderboard, myRank, state, stats],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp 必须在 AppProvider 内使用");
  }
  return context;
};

export const useLevelById = (levelId: number) => {
  const { state } = useApp();
  return state.levels.find((item) => item.id === levelId);
};
