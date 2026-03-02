import { useMemo, useState } from "react";
import { PageShell } from "../components/PageShell";
import { useApp } from "../context/AppContext";

export const LearningPage = () => {
  const { state, actions } = useApp();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">("all");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const materials = useMemo(
    () =>
      state.learningMaterials.filter(
        (item) =>
          item.status === 1 &&
          (selectedCategoryId === "all" || item.categoryId === selectedCategoryId),
      ),
    [selectedCategoryId, state.learningMaterials],
  );

  const completeMaterial = async (materialId: number) => {
    try {
      setBusyId(materialId);
      setMessage("");
      await actions.completeLearning(materialId);
      setMessage("学习完成已记录，任务复活进度已更新，并奖励 +10 积分。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "记录学习失败");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <PageShell title="学习中心" showTabBar>
      <div className="scene-switcher">
        <button
          type="button"
          className={`chip-btn ${selectedCategoryId === "all" ? "active" : ""}`}
          onClick={() => setSelectedCategoryId("all")}
        >
          全部
        </button>
        {state.learningCategories.map((category) => (
          <button
            type="button"
            key={category.id}
            className={`chip-btn ${selectedCategoryId === category.id ? "active" : ""}`}
            onClick={() => setSelectedCategoryId(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {message ? <p className="feedback-text">{message}</p> : null}

      <div className="level-list">
        {materials.map((material) => {
          const completed = state.learningRecords.some(
            (record) => record.materialId === material.id && record.status === "completed",
          );
          return (
            <article className="level-card" key={material.id}>
              <div className="level-header">
                <h3>{material.title}</h3>
                <span className="tag">{material.type}</span>
              </div>
              <p className="muted">{material.summary}</p>
              <p className="muted">
                标签：{material.tags.join(" · ")} ｜ 建议时长：{material.durationHint}
              </p>

              <div className="grid-two">
                <a className="ghost-btn" href={material.url} target="_blank" rel="noreferrer">
                  打开资料
                </a>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => void completeMaterial(material.id)}
                  disabled={busyId === material.id || completed}
                >
                  {completed ? "已完成" : busyId === material.id ? "记录中..." : "标记完成"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </PageShell>
  );
};
