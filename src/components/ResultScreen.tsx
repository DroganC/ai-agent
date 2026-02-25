import { observer } from "mobx-react-lite";
import styles from "../app.module.css";
import { gameStore } from "../store/gameStore";

const ResultScreen = observer(() => {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>恭喜通关！</h2>
      <div className={styles.mantra}>提 · 拔 · 握 · 压</div>
      <p className={styles.lead}>火灾初期 3 分钟是灭火黄金时间。</p>
      <div className={styles.footerTip}>
        本游戏仅为教学参考，实际火灾中需优先保障自身安全，必要时及时拨打 119。
      </div>
      <div className={styles.actionRow}>
        <button className={styles.secondary} onClick={() => gameStore.resetGame()}>
          再学一遍
        </button>
      </div>
    </section>
  );
});

export default ResultScreen;
