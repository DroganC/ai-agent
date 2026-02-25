import { observer } from "mobx-react-lite";
import styles from "../../app.module.css";
import { gameStore } from "../../store/gameStore";

const StageSpray = observer(() => {
  return (
    <div className={styles.stageWrap}>
      <div className={styles.sceneTitle}>关卡 3：喷射灭火</div>
      <div className={styles.sprayScene}>
        <div className={gameStore.spraying ? `${styles.fireBig} ${styles.fireFade}` : styles.fireBig} />
        <div
          className={
            gameStore.spraying
              ? `${styles.sprayMist} ${styles.sprayMistActive}`
              : styles.sprayMist
          }
        />
        <div className={styles.sprayData}>
          <span className={styles.sprayPressure}>压力值：正常</span>
          <span className={styles.sprayMantra}>提 · 拔 · 握 · 压</span>
        </div>
        <div className={styles.extinguisherFront}>
          <button
            className={
              gameStore.spraying
                ? `${styles.handlePress} ${styles.sprayButtonActive}`
                : styles.handlePress
            }
            onClick={() => gameStore.startSpray()}
          >
            喷射
          </button>
        </div>
        <div
          className={
            gameStore.spraying
              ? `${styles.sprayParticles} ${styles.sprayActive}`
              : styles.sprayParticles
          }
        />
        <div
          className={
            gameStore.spraying
              ? `${styles.sprayLayers} ${styles.sprayLayersActive}`
              : styles.sprayLayers
          }
        >
          <div className={styles.sprayLayer} />
          <div className={`${styles.sprayLayer} ${styles.sprayLayerTwo}`} />
          <div className={`${styles.sprayLayer} ${styles.sprayLayerThree}`} />
        </div>
      </div>
      <div className={styles.tipText}>点击喷射按钮，观察白色粒子扩散。</div>
    </div>
  );
});

export default StageSpray;
