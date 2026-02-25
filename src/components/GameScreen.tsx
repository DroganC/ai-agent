import { observer } from "mobx-react-lite";
import styles from "../app.module.css";
import { gameStore } from "../store/gameStore";
import StageSort from "./stages/StageSort";
import StagePressure from "./stages/StagePressure";
import StageSpray from "./stages/StageSpray";

const STAGE_TITLES = ["提拔握压排序", "选择压力区域", "喷射灭火"] as const;

const GameScreen = observer(() => {
  const stageTitle = STAGE_TITLES[gameStore.stageIndex];

  return (
    <section className={styles.gamePanel}>
      <div className={styles.stageHeader}>
        <span>当前步骤</span>
        <strong>{stageTitle}</strong>
        <div className={styles.progress}>
          {STAGE_TITLES.map((_, index) => (
            <span
              key={index}
              className={
                index <= gameStore.stageIndex ? styles.progressActive : styles.progressIdle
              }
            />
          ))}
        </div>
      </div>

      <div className={styles.scene}>
        {gameStore.stageIndex === 0 && <StageSort />}
        {gameStore.stageIndex === 1 && <StagePressure />}
        {gameStore.stageIndex === 2 && <StageSpray />}
      </div>

      <div className={styles.hintBox} data-tone={gameStore.hint.tone}>
        <span>提示</span>
        <p>{gameStore.hint.text}</p>
      </div>
    </section>
  );
});

export default GameScreen;
