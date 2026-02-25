import { observer } from "mobx-react-lite";
import styles from "../app.module.css";
import { gameStore } from "../store/gameStore";

const IntroScreen = observer(() => {
  return (
    <section className={styles.card}>
      <h1 className={styles.title}>灭火器使用教育小游戏</h1>
      <p className={styles.lead}>
        火灾无情，掌握灭火器使用方法能在紧急时刻保护自己和他人，快来学习吧！
      </p>
      <div className={styles.hero}>
        <div className={styles.fire} />
        <div className={styles.extinguisher}>
          <div className={styles.handle} />
          <div className={styles.pin} />
          <div className={styles.nozzle} />
        </div>
      </div>
      <div className={styles.actionRow}>
        <button className={styles.primary} onClick={() => gameStore.startGame()}>
          开始学习
        </button>
      </div>
    </section>
  );
});

export default IntroScreen;
