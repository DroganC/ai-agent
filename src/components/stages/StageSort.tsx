import { observer } from "mobx-react-lite";
import { useRef } from "react";
import styles from "../../app.module.css";
import { gameStore } from "../../store/gameStore";

const StageSort = observer(() => {
  const slotsRef = useRef<HTMLDivElement | null>(null);
  const remaining = gameStore.steps.filter((step) => !gameStore.placed.includes(step));

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>, id: string) => {
    event.preventDefault();
    gameStore.startDrag(id, event.clientX, event.clientY);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!gameStore.draggingId) return;
    const rect = slotsRef.current?.getBoundingClientRect();
    if (!rect) return;
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!inside) {
      gameStore.updateDrag(event.clientX, event.clientY, null);
      return;
    }

    const slotWidth = rect.width / 4;
    const index = Math.min(3, Math.max(0, Math.floor((event.clientX - rect.left) / slotWidth)));
    gameStore.updateDrag(event.clientX, event.clientY, index);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!gameStore.draggingId) return;
    const rect = slotsRef.current?.getBoundingClientRect();
    if (!rect) return;
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    let index: number | null = null;
    if (inside) {
      const slotWidth = rect.width / 4;
      index = Math.min(3, Math.max(0, Math.floor((event.clientX - rect.left) / slotWidth)));
    }
    gameStore.endDrag(inside, index);
  };

  return (
    <div className={styles.stageWrap} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
      <div className={styles.sceneTitle}>关卡 1：提拔握压卡片排序</div>
      <div className={styles.sortScene}>
        <div className={styles.sortDeck}>
          {remaining.map((step) => (
            <button
              key={step}
              className={
                gameStore.bounceId === step
                  ? `${styles.sortCard} ${styles.cardBounce}`
                  : styles.sortCard
              }
              onPointerDown={(event) => onPointerDown(event, step)}
            >
              {step}
            </button>
          ))}
        </div>
        <div ref={slotsRef} className={styles.sortSlots}>
          {Array.from({ length: 4 }).map((_, index) => {
            const item = gameStore.placed[index];
            return (
              <div
                key={index}
                className={
                  gameStore.activeSlot === index
                    ? `${styles.sortSlot} ${styles.sortSlotActive}`
                    : styles.sortSlot
                }
              >
                {item && (
                  <button
                    className={
                      gameStore.snapId === item
                        ? `${styles.sortCardPlaced} ${styles.cardSnap}`
                        : styles.sortCardPlaced
                    }
                    onPointerDown={(event) => onPointerDown(event, item)}
                  >
                    {item}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.tipText}>将卡片拖到下方放置栏，按顺序排列。</div>
      {gameStore.draggingId && (
        <div className={styles.dragGhost} style={{ left: gameStore.dragPos.x, top: gameStore.dragPos.y }}>
          {gameStore.draggingId}
        </div>
      )}
    </div>
  );
});

export default StageSort;
