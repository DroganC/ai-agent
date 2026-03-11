import { useEffect, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { reaction } from 'mobx';
import { useNavigate } from 'react-router-dom';
import { fetchMe } from '../../services/user';
import { fetchLevelsByModule } from '../../services/levels';
import type { Level } from '../../types/api';
import { useStores } from '../../stores';
import { Page } from '../../components/common/Page';
import { Loading } from '../../components/common/Loading';
import { ErrorView } from '../../components/common/ErrorView';
import { PullToRefreshContainer } from '../../components/common/PullToRefreshContainer';
import { Icon } from '../../icons';
import { getErrorMessage } from '../../utils/error';
import styles from './Hall.module.less';

/** 训练概览页（兼容旧入口，当前主入口为首页 Home） */
export const Hall = observer(function Hall() {
  const { authStore, uiStore } = useStores();
  const navigate = useNavigate();
  const [levels, setLevels] = useState<Level[]>([]);
  const [search, setSearch] = useState<string>('');
  const [tab, setTab] = useState<'overview' | 'analytics'>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      await fetchMe();
      const lv = await fetchLevelsByModule(1);
      setLevels(lv);
      setError(null);
    } catch (e: unknown) {
      setError(getErrorMessage(e, '加载失败'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const dispose = reaction(() => uiStore.scene, () => void load(), { fireImmediately: true });
    return () => dispose();
  }, [uiStore, load]);

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  void authStore.user;
  const filteredLevels: Level[] = levels.filter((level) => level.name.toLowerCase().includes(search.toLowerCase()));
  const project: Level | undefined = filteredLevels[0];
  const recentTasks: Level[] = filteredLevels.slice(0, 2);
  const progress: number = project ? Math.min(100, Math.max(0, Math.round((project.reward_points / 2000) * 100))) : 50;

  return (
    <Page>
      <PullToRefreshContainer onRefresh={load}>
        <div className={styles.wrap}>
        <div className={styles.topRow}>
          <div className={styles.title}>
            <span>训练概览</span>
            <span className={styles.titleIcon} />
          </div>
          <button className={styles.addBtn} type="button">
            <Icon name="plus" size={18} weight="bold" />
          </button>
        </div>

        <div className={styles.searchWrap}>
          <Icon name="search" size={18} weight="bold" />
          <input
            className={styles.searchInput}
            placeholder="搜索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Icon name="filter" size={18} weight="bold" />
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${tab === 'overview' ? styles.tabActive : ''}`}
            onClick={() => setTab('overview')}
          >
            概览
          </button>
          <button
            type="button"
            className={`${styles.tab} ${tab === 'analytics' ? styles.tabActive : ''}`}
            onClick={() => setTab('analytics')}
          >
            数据
          </button>
        </div>

        <div className={styles.sectionRow}>
          <div className={styles.sectionLeft}>
            <Icon name="dots" size={18} weight="bold" />
            <span>我的训练</span>
          </div>
          <Icon name="caretRight" size={18} weight="bold" />
        </div>

        <div className={styles.card}>
          <div className={styles.cardTop}>
            <div className={styles.cardTitle}>{project?.name ?? 'Mane UIKit'}</div>
            <div className={styles.avatars}>
              <div className={`${styles.avatar} ${styles.avatarFirst}`} />
              <div className={styles.avatar} />
              <div className={styles.avatar} />
              <div className={`${styles.avatar} ${styles.avatarPlus}`}>+4</div>
            </div>
          </div>

          <div className={styles.dates}>
            <Icon name="calendar" size={16} weight="bold" />
            <span>01/01/2021</span>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: 'rgba(181,181,199,0.85)' }} />
            <span className={styles.dotLine} />
            <Icon name="calendar" size={16} weight="bold" />
            <span style={{ color: '#5b3df5', fontWeight: 800 }}>01/02/2021</span>
          </div>

          <div className={styles.progressRow}>
            <span style={{ color: '#1b1b39', width: 40 }}>{progress}%</span>
            <div className={styles.progressBar}>
              <div className={styles.progressInner} style={{ width: `${progress}%` }} />
            </div>
            <span className={styles.tasksRight}>24/48 tasks</span>
          </div>
        </div>

        <div className={styles.sectionRow} style={{ marginTop: 22 }}>
          <div className={styles.sectionLeft}>
            <Icon name="smile" size={18} weight="bold" />
            <span>最近训练</span>
          </div>
          <Icon name="caretRight" size={18} weight="bold" />
        </div>

        <div className={styles.taskList}>
          {recentTasks.map((t) => (
            <div key={t.id} className={styles.taskCard} onClick={() => navigate(`/level/${t.id}/prepare`)}>
              <div className={styles.taskLeft}>
                <div className={styles.taskIcon}>
                  <span className={styles.titleIcon} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className={styles.taskTitle}>{t.name}</div>
                  <div className={styles.taskSub}>
                    <Icon name="calendar" size={14} weight="bold" />
                    <span>截止：03/01/2021</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {recentTasks.length === 0 && <div style={{ padding: '10px 0', color: '#b5b5c7' }}>暂无训练</div>}
        </div>
      </div>
      </PullToRefreshContainer>
    </Page>
  );
});
