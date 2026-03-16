/**
 * 连连看 - 消防器材识别（主游戏组件）
 * 适配本工程：Page、Button、GameRenderProps、相对路径、link-match 类名前缀
 */
import { useRef, useCallback, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Toast } from 'antd-mobile';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Page } from '../../common/Page';
import { PageHeader } from '../../common/PageHeader';
import { Button } from '../../common/Button';
import { Icon } from '../../../icons';
import type { GameRenderProps } from '../renderGame';
import type { PlayRouteState } from '../../../types/api';
import { settleAttempt } from '../../../services/attempts';
import { gameStore } from './gameStore';
import { TYPES } from './types';
import type { Point, MatchedTipDisplay, AnimatingPair } from './types';
import co2Icon from './assets/co2.png';
import dryPowderIcon from './assets/dry-powder.png';
import waterBasedIcon from './assets/water-based.png';
import foamIcon from './assets/foam.png';

/** 四种灭火器图标，顺序与 TYPES 一致：二氧化碳、干粉、水基、泡沫 */
const TYPE_ICONS = [co2Icon, dryPowderIcon, waterBasedIcon, foamIcon] as const;
import { getPath } from './utils';
import {
  LINE_DURATION_MS,
  LINE_CLEAR_DELAY_MS,
  MATCH_ANIMATION_MS,
  HINT_HIGHLIGHT_MS,
  HINT_COOLDOWN_MS,
  SHUFFLE_SHAKE_MS,
} from './constants';
import './LinkMatchGame.less';

function LinkMatchGame({ level, onExit }: GameRenderProps): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useLocation();
  const attemptId: number | undefined = (state as PlayRouteState | null)?.attemptId;

  const startAtRef = useRef<number>(Date.now());
  const [settled, setSettled] = useState<boolean>(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lineSvgRef = useRef<SVGSVGElement>(null);
  const [animatingOut, setAnimatingOut] = useState<AnimatingPair | null>(null);
  const [hintCooldown, setHintCooldown] = useState<number>(0);
  const [lastMatchedTip, setLastMatchedTip] = useState<MatchedTipDisplay | null>(null);
  const [shuffleShake, setShuffleShake] = useState<boolean>(false);
  const isBusy = animatingOut !== null;

  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalIdsRef = useRef<ReturnType<typeof setInterval>[]>([]);
  /** 进入即开始游戏，不显示首页 */
  useEffect(() => {
    if (gameStore.screen === 'start') gameStore.startGame();
  }, []);

  // 通关后统一跳转通关页（并结算 attempt）
  useEffect(() => {
    const run = async (): Promise<void> => {
      if (gameStore.screen !== 'end') return;
      if (settled) return;
      setSettled(true);
      if (attemptId != null) {
        try {
          await settleAttempt(attemptId, {
            status: 'passed',
            duration_ms: Date.now() - startAtRef.current,
            score: level.reward_points,
            error_count: 0,
            key_error_count: 0,
          });
        } catch {
          // ignore: 通关页仍可展示
        }
      }
      if (id != null && attemptId != null) {
        navigate(`/level/${id}/pass`, { replace: true, state: { attemptId } });
        return;
      }
      onExit();
    };
    void run();
  }, [attemptId, id, level.reward_points, navigate, onExit, settled]);

  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((id) => clearTimeout(id));
      intervalIdsRef.current.forEach((id) => clearInterval(id));
      timeoutIdsRef.current = [];
      intervalIdsRef.current = [];
    };
  }, []);


  const getRect = useCallback((r: number, c: number): DOMRect | null => {
    const key = `${r}-${c}`;
    const el = cellRefs.current[key];
    return el?.getBoundingClientRect() ?? null;
  }, []);

  const drawLine = useCallback((path: Point[]): void => {
    if (!path.length || !lineSvgRef.current) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    lineSvgRef.current.setAttribute('viewBox', `0 0 ${W} ${H}`);
    let d = `M ${path[0].x} ${path[0].y}`;
    for (let i = 1; i < path.length; i++) d += ` L ${path[i].x} ${path[i].y}`;
    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const rootStyle = getComputedStyle(document.documentElement);
    const lineColor =
      rootStyle.getPropertyValue('--game-link-line-stroke').trim() || 'rgba(96, 165, 250, 1)';
    pathEl.setAttribute('d', d);
    pathEl.setAttribute('fill', 'none');
    pathEl.setAttribute('stroke', lineColor);
    pathEl.setAttribute('stroke-width', '2');
    pathEl.setAttribute('stroke-linecap', 'round');
    pathEl.setAttribute('stroke-linejoin', 'round');
    lineSvgRef.current.innerHTML = '';
    lineSvgRef.current.appendChild(pathEl);
    const len = pathEl.getTotalLength();
    pathEl.style.strokeDasharray = String(len);
    pathEl.style.strokeDashoffset = String(len);
    pathEl.animate(
      [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
      { duration: LINE_DURATION_MS, easing: 'ease-out', fill: 'forwards' }
    );
    setTimeout(() => {
      if (lineSvgRef.current) lineSvgRef.current.innerHTML = '';
    }, LINE_CLEAR_DELAY_MS);
  }, []);

  const handleCellClick = useCallback(
    (r: number, c: number) => {
      if (isBusy) return;
      const typeId = gameStore.grid[r]?.[c];
      if (typeId !== undefined && typeId >= 0) {
        const tipInfo = TYPES[typeId];
        if (tipInfo) setLastMatchedTip({ name: tipInfo.name, tip: tipInfo.tip });
      }
      const result = gameStore.selectCell(r, c);
      if (
        result.connected &&
        result.typeId !== undefined &&
        result.r1 !== undefined &&
        result.c1 !== undefined &&
        result.r2 !== undefined &&
        result.c2 !== undefined
      ) {
        const path = getPath(
          gameStore.grid,
          gameStore.rows,
          gameStore.cols,
          getRect,
          result.r1,
          result.c1,
          result.r2,
          result.c2
        );
        drawLine(path);
        setAnimatingOut({
          r1: result.r1,
          c1: result.c1,
          r2: result.r2,
          c2: result.c2,
          typeId: result.typeId,
        });
        const id1 = setTimeout(() => {
          const el1 = cellRefs.current[`${result.r1}-${result.c1}`];
          const el2 = cellRefs.current[`${result.r2}-${result.c2}`];
          el1?.classList.add('link-match-cell-matched');
          el2?.classList.add('link-match-cell-matched');
          const id2 = setTimeout(() => {
            gameStore.commitClear(result.r1!, result.c1!, result.r2!, result.c2!);
            setAnimatingOut(null);
          }, MATCH_ANIMATION_MS);
          timeoutIdsRef.current.push(id2);
        }, LINE_CLEAR_DELAY_MS);
        timeoutIdsRef.current.push(id1);
      }
    },
    [getRect, drawLine, isBusy]
  );

  if (gameStore.screen === 'end') {
    return (
      <Page showTab={false}>
        <div className="link-match-game screen end">
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <PageHeader
              title="全部消除完成"
              description={`共 ${gameStore.totalPairs} 对灭火器，全部认全啦！`}
              onBack={onExit}
            />
          </div>
          <p className="link-match-desc">
            四种灭火器各有适用场景，生活中遇到火情要先判断类型再选对灭火器哦。
          </p>
          <Button className="link-match-btn-action" full variant="secondary" onClick={onExit}>
            返回
          </Button>
        </div>
      </Page>
    );
  }

  const handleShuffle = (): void => {
    if (shuffleShake) return;
    const noSolution = !gameStore.hasSolution();
    setShuffleShake(true);
    const id = setTimeout(() => {
      setShuffleShake(false);
      gameStore.shuffle();
      if (noSolution) Toast.show({ content: '当前无解，已重新排列', position: 'bottom', duration: 2000 });
    }, SHUFFLE_SHAKE_MS);
    timeoutIdsRef.current.push(id);
  };

  const hint = (): void => {
    if (hintCooldown > 0) return;
    const h = gameStore.findHint();
    if (!h) {
      Toast.show({ content: '当前无解，请点击重排', position: 'bottom', duration: 2000 });
      return;
    }
    setHintCooldown(HINT_COOLDOWN_MS);
    const el1 = cellRefs.current[`${h.r1}-${h.c1}`];
    const el2 = cellRefs.current[`${h.r2}-${h.c2}`];
    [el1, el2].forEach((el) => el?.classList.add('hint'));
    const hideId = setTimeout(() => {
      [el1, el2].forEach((el) => el?.classList.remove('hint'));
    }, HINT_HIGHLIGHT_MS);
    timeoutIdsRef.current.push(hideId);
    const t = setInterval(() => {
      setHintCooldown((prev) => {
        const next = prev - 200;
        if (next <= 0) clearInterval(t);
        return Math.max(0, next);
      });
    }, 200);
    intervalIdsRef.current.push(t);
  };

  return (
    <Page showTab={false}>
      <div className={`link-match-game play ${isBusy ? 'link-match-game-busy' : ''}`}>
        <PageHeader
          title={level.name}
          description={`已消除：${gameStore.pairsDone} / ${gameStore.pairsTotal}`}
          onBack={onExit}
        />
        <div
          className={`link-match-grid ${shuffleShake ? 'link-match-grid-shake' : ''}`}
          ref={gridRef}
          style={{ gridTemplateColumns: `repeat(${gameStore.cols}, 1fr)` }}
        >
          {Array.from({ length: gameStore.rows }, (_, r) =>
            Array.from({ length: gameStore.cols }, (_, c) => {
              const type = gameStore.grid[r]?.[c] ?? -1;
              const key = `${r}-${c}`;
              const isSelected = gameStore.selected?.r === r && gameStore.selected?.c === c;
              return (
                <div
                  key={key}
                  ref={(el) => {
                    cellRefs.current[`${r}-${c}`] = el;
                  }}
                  className={`link-match-cell ${type === -1 ? 'empty' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => type !== -1 && handleCellClick(r, c)}
                  title={type >= 0 ? TYPES[type]?.name : ''}
                >
                  {type >= 0 && (
                    <img
                      src={TYPE_ICONS[type]}
                      alt={TYPES[type].name}
                      className="link-match-cell-icon"
                    />
                  )}
                </div>
              );
            })
          ).flat()}
        </div>
        <div className="link-match-tip-area">
          {lastMatchedTip ? (
            <div className="link-match-tip-inline">
              <div className="link-match-tip-inline-title">{lastMatchedTip.name}</div>
              <div className="link-match-tip-inline-desc">{lastMatchedTip.tip}</div>
            </div>
          ) : (
            <div className="link-match-tip-inline-placeholder">点击任意格子查看小知识</div>
          )}
        </div>
        <div className="link-match-actions-bar">
          <button
            type="button"
            className="link-match-action-btn link-match-action-btn--hint"
            onClick={hint}
            disabled={isBusy || hintCooldown > 0}
            aria-label="提示"
          >
            <Icon name="search" size={16} weight="bold" />
            <span>{hintCooldown > 0 ? `${Math.ceil(hintCooldown / 1000)}s` : '提示'}</span>
          </button>
          <button
            type="button"
            className="link-match-action-btn link-match-action-btn--shuffle"
            onClick={handleShuffle}
            disabled={isBusy || shuffleShake}
            aria-label="重排"
          >
            <Icon name="refresh" size={16} weight="bold" />
            <span>重排</span>
          </button>
        </div>
        <svg ref={lineSvgRef} className="link-match-line-svg" aria-hidden />
      </div>
    </Page>
  );
}

const ObservedLinkMatchGame = observer(LinkMatchGame);
export default ObservedLinkMatchGame;
