import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import styles from "../../app.module.css";
import { gameStore } from "../../store/gameStore";

const StagePressure = observer(() => {
  useEffect(() => {
    gameStore.startPressureJitter();
    return () => {
      // 组件卸载时交给 store 清理
    };
  }, [gameStore.pointerSet, gameStore.selection]);

  return (
    <div className={styles.stageWrap}>
      <div className={styles.sceneTitle}>关卡 2：选择压力区域</div>
      <div className={styles.pressureScene}>
        <div className={styles.pressureButtons}>
          <button
            className={
              gameStore.selection === "low"
                ? `${styles.pressureBtn} ${styles.pressureLow} ${styles.pressureActive}`
                : `${styles.pressureBtn} ${styles.pressureLow}`
            }
            onClick={() => gameStore.selectPressure("low")}
          >
            过低
          </button>
          <button
            className={
              gameStore.selection === "normal"
                ? `${styles.pressureBtn} ${styles.pressureNormal} ${styles.pressureActive}`
                : `${styles.pressureBtn} ${styles.pressureNormal}`
            }
            onClick={() => gameStore.selectPressure("normal")}
          >
            正常
          </button>
          <button
            className={
              gameStore.selection === "high"
                ? `${styles.pressureBtn} ${styles.pressureHigh} ${styles.pressureActive}`
                : `${styles.pressureBtn} ${styles.pressureHigh}`
            }
            onClick={() => gameStore.selectPressure("high")}
          >
            过高
          </button>
        </div>
        <div className={styles.pressureGauge} onClick={() => gameStore.confirmPressure()}>
          <div className={styles.gaugeTicks} />
          <div className={styles.gaugeDial} />
          <div
            className={styles.gaugePointer}
            data-zone={gameStore.selection ?? "none"}
            data-set={gameStore.pointerSet ? "yes" : "no"}
          />
          <div
            className={
              gameStore.pulse
                ? `${styles.gaugeValue} ${styles.gaugeValuePulse}`
                : styles.gaugeValue
            }
          >
            {gameStore.value}
          </div>
          <div className={styles.gaugeZones}>
            <span>低</span>
            <span>正常</span>
            <span>高</span>
          </div>
        </div>
      </div>
      <div className={styles.tipText}>先选择压力档位，再点击转盘确认。</div>
    </div>
  );
});

export default StagePressure;
