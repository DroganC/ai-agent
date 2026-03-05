import { useEffect, useState } from 'react';
import { fetchCategories, fetchMaterials, submitLearningRecord } from '../services/learning';
import { LearningCategory, LearningMaterial } from '../types/api';
import { Page } from '../components/common/Page';
import { Loading } from '../components/common/Loading';
import { ErrorView } from '../components/common/ErrorView';
import { getErrorMessage } from '../utils/error';

export const Learning = () => {
  const [cats, setCats] = useState<LearningCategory[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [activeCat, setActiveCat] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (categoryId?: number) => {
    try {
      setLoading(true);
      const [c, m] = await Promise.all([fetchCategories(), fetchMaterials(categoryId)]);
      setCats(c);
      setMaterials(m);
      setError(null);
    } catch (e: unknown) {
      setError(getErrorMessage(e, '加载失败'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markDone = async (id: number) => {
    await submitLearningRecord(id, 'completed');
    alert('已标记完成');
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={() => load(activeCat || undefined)} />;

  return (
    <Page>
      <div className="mt-3 space-y-3">
        <div className="card p-4 shadow-sm">
          <div className="flex gap-2 overflow-x-auto pb-1 flex-nowrap">
            <button
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                activeCat === null ? 'bg-primary text-white shadow-sm' : 'bg-[#f1f2f6] text-gray-700'
              }`}
              onClick={() => { setActiveCat(null); load(); }}
            >
              全部
            </button>
            {cats.map((c) => (
              <button
                key={c.id}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                  activeCat === c.id ? 'bg-primary text-white shadow-sm' : 'bg-[#f1f2f6] text-gray-700'
                }`}
                onClick={() => { setActiveCat(c.id); load(c.id); }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="card divide-y divide-slate-100 shadow-sm">
          {materials.map((m) => (
            <div key={m.id} className="px-4 py-3 text-sm flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#1f1f3d]">{m.title}</div>
                <div className="text-xs text-gray-500">类型 {m.type}</div>
              </div>
              <button className="px-3 py-2 rounded-full bg-primary text-white text-xs shadow-sm" onClick={() => markDone(m.id)}>
                完成
              </button>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
};
