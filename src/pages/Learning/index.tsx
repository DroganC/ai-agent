import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Toast } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { submitLearningRecord } from '../../services/learning';
import { getErrorMessage } from '../../utils/error';
import { useStores } from '../../stores';
import { Page } from '../../components/common/Page';
import { Loading } from '../../components/common/Loading';
import { ErrorView } from '../../components/common/ErrorView';
import { PageHeader } from '../../components/common/PageHeader';
import { PullToRefreshContainer } from '../../components/common/PullToRefreshContainer';
import { CategoryFilterRow } from './components/CategoryFilterRow';
import { MaterialListItem } from './components/MaterialListItem';

/**
 * 学习中心页
 * 按分类展示学习材料，可标记「完成」；状态由 learningStore 统一管理
 */
export const Learning = observer(function Learning() {
  const navigate = useNavigate();
  const { learningStore } = useStores();

  /** 初始加载 */
  useEffect(() => {
    void learningStore.load();
  }, [learningStore]);

  /** 标记某条材料为已完成 */
  const handleMarkDone = async (id: number): Promise<void> => {
    try {
      await submitLearningRecord(id, 'completed');
      Toast.show({ content: '已标记完成', duration: 1200 });
    } catch (e: unknown) {
      Toast.show({ content: getErrorMessage(e, '标记失败，请重试'), duration: 2000 });
    }
  };

  /** 选全部并刷新 */
  const handleSelectAll = (): void => {
    learningStore.selectAll();
    void learningStore.load();
  };

  if (learningStore.loading) return <Loading />;
  if (learningStore.error) return <ErrorView message={learningStore.error} onRetry={() => void learningStore.load()} />;

  const refresh = async () => {
    await learningStore.load(learningStore.activeCategoryId ?? undefined);
  };

  return (
    <Page showTab={false}>
      <PullToRefreshContainer onRefresh={refresh}>
        <div className="screen">
          <div className="stack" style={{ gap: 'var(--space-3)' }}>
            <PageHeader
              title="学习中心"
              description="按分类查看并完成学习材料"
              onBack={() => navigate(-1)}
            />

            <CategoryFilterRow
            categories={learningStore.categories}
            activeCategoryId={learningStore.activeCategoryId}
            onSelectAll={handleSelectAll}
            onSelectCategory={(id) => void learningStore.selectCategory(id)}
          />

          <div>
            <div className="sectionTitle">学习材料</div>
            <div className="subtle" style={{ marginBottom: 'var(--space-2)' }}>
              选择一条材料后可标记完成
            </div>
            <div className="sectionCard">
              <ul className="sectionCardList">
                {learningStore.materials.map((m) => (
                  <MaterialListItem key={m.id} material={m} onMarkDone={handleMarkDone} />
                ))}
                {learningStore.materials.length === 0 && (
                  <li className="sectionCardList__item">
                    <span className="subtle">暂无材料</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
          </div>
        </div>
      </PullToRefreshContainer>
    </Page>
  );
});
