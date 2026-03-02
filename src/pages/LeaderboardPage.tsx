import { useMemo, useState } from "react";
import { PageShell } from "../components/PageShell";
import { useApp } from "../context/AppContext";
import { formatDateTime, formatDuration } from "../utils/helpers";

export const LeaderboardPage = () => {
  const { state, leaderboard, myRank, actions } = useApp();
  const [loading, setLoading] = useState(false);

  const myEntry = useMemo(
    () => leaderboard.find((item) => item.userId === state.currentUser?.id),
    [leaderboard, state.currentUser?.id],
  );

  const refresh = async () => {
    try {
      setLoading(true);
      await actions.refreshLeaderboard();
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="个人排行榜"
      showTabBar
      rightSlot={
        <button type="button" className="mini-btn" onClick={() => void refresh()} disabled={loading}>
          {loading ? "刷新中" : "刷新"}
        </button>
      }
    >
      <div className="section-card">
        <header className="section-header">
          <h3>我的排名</h3>
          <span className="tag">更新时间 {formatDateTime(state.lastLeaderboardRefreshAt)}</span>
        </header>
        {myEntry ? (
          <div className="my-rank-row">
            <strong>#{myRank}</strong>
            <div>
              <p>{myEntry.userName}</p>
              <p className="muted">
                总分 {myEntry.totalScore} ｜ 最佳用时{" "}
                {Number.isFinite(myEntry.bestDurationMs) && myEntry.bestDurationMs < Number.MAX_SAFE_INTEGER
                  ? formatDuration(myEntry.bestDurationMs)
                  : "--:--"}
              </p>
            </div>
          </div>
        ) : (
          <p className="muted">当前还未上榜，先去闯关吧。</p>
        )}
      </div>

      <div className="section-card">
        <header className="section-header">
          <h3>榜单</h3>
        </header>
        <ul className="rank-list">
          {leaderboard.slice(0, 50).map((entry, index) => (
            <li key={`${entry.userId}-${index}`} className={entry.userId === state.currentUser?.id ? "mine" : ""}>
              <span>#{index + 1}</span>
              <div>
                <p>{entry.userName}</p>
                <p className="muted">
                  {entry.departmentName} · {entry.baseName}
                </p>
              </div>
              <div className="rank-score">
                <strong>{entry.totalScore}</strong>
                <small>{formatDuration(entry.bestDurationMs)}</small>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
};
