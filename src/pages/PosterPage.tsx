import { useMemo, useState } from "react";
import { PageShell } from "../components/PageShell";
import { useApp } from "../context/AppContext";
import { buildPosterDataUrl } from "../utils/poster";
import { copyText, formatDuration } from "../utils/helpers";

export const PosterPage = () => {
  const { state, stats } = useApp();
  const [template, setTemplate] = useState<1 | 2>(1);
  const [desensitizeName, setDesensitizeName] = useState(false);
  const [posterUrl, setPosterUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const shareText = useMemo(
    () =>
      `我在 EHS 安全能力闯关训练平台获得总分 ${stats.totalScore}，累计通关 ${stats.passLevelCount} 关，欢迎来挑战！`,
    [stats.passLevelCount, stats.totalScore],
  );

  const onGenerate = async () => {
    if (!state.currentUser) return;
    try {
      setLoading(true);
      setMsg("");
      const dataUrl = buildPosterDataUrl({
        name: state.currentUser.name,
        departmentName: state.currentUser.departmentName,
        baseName: state.currentUser.baseName,
        totalScore: stats.totalScore,
        bestDurationLabel:
          Number.isFinite(stats.bestDurationMs) && stats.bestDurationMs < Number.MAX_SAFE_INTEGER
            ? formatDuration(stats.bestDurationMs)
            : "--:--",
        passLevelCount: stats.passLevelCount,
        template,
        desensitizeName,
      });
      setPosterUrl(dataUrl);
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "海报生成失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="战绩海报" showBack backTo="/profile">
      <div className="section-card">
        <header className="section-header">
          <h3>模板选择</h3>
        </header>
        <div className="scene-switcher">
          <button type="button" className={`chip-btn ${template === 1 ? "active" : ""}`} onClick={() => setTemplate(1)}>
            模板 A（蓝）
          </button>
          <button type="button" className={`chip-btn ${template === 2 ? "active" : ""}`} onClick={() => setTemplate(2)}>
            模板 B（红）
          </button>
        </div>
        <label className="switch-line">
          <input
            type="checkbox"
            checked={desensitizeName}
            onChange={(event) => setDesensitizeName(event.target.checked)}
          />
          姓名脱敏
        </label>
        <button type="button" className="primary-btn block-btn" onClick={() => void onGenerate()} disabled={loading}>
          {loading ? "生成中..." : "生成海报"}
        </button>
      </div>

      {msg ? <p className="feedback-text">{msg}</p> : null}

      {posterUrl ? (
        <div className="section-card">
          <header className="section-header">
            <h3>海报预览</h3>
          </header>
          <img src={posterUrl} alt="海报预览" className="poster-preview" />
          <div className="grid-two">
            <a href={posterUrl} download="ehs-poster.png" className="primary-btn">
              保存图片
            </a>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => {
                void copyText(shareText).then((ok) => setMsg(ok ? "已复制分享文案" : "复制失败，请手动复制"));
              }}
            >
              复制文案
            </button>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
};
