import { observer } from "mobx-react-lite";
import styles from "./app.module.css";
import { gameStore } from "./store/gameStore";
import IntroScreen from "./components/IntroScreen";
import GameScreen from "./components/GameScreen";
import ResultScreen from "./components/ResultScreen";

const App = observer(() => {
  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <div className={styles.logo}>消防小课堂</div>
        <div className={styles.badge}>提 拔 握 压</div>
      </header>

      {gameStore.screen === "intro" && <IntroScreen />}
      {gameStore.screen === "game" && <GameScreen />}
      {gameStore.screen === "result" && <ResultScreen />}
    </div>
  );
});

export default App;
