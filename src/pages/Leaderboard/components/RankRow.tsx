import { Icon } from '../../../icons';
import { ProgressMini } from '../../../components/common/ProgressMini';
import type { LeaderboardItem } from '../../../types/api';

export type RankRowProps = {
  /** 排行榜单条数据 */
  item: LeaderboardItem;
};

/**
 * 排行榜单行（用于 .sectionCardList__item 内）：排名、昵称、部门、得分、用时、进度条
 */
export function RankRow({ item }: RankRowProps) {
  const durationSec = (item.best_duration_ms / 1000).toFixed(0);
  const progressPercent = Math.min(100, (item.total_score / 2000) * 100);
  const isTop3 = item.rank <= 3;

  return (
    <>
      <div className="rank-row__left">
        <span className={`rank-row__badge ${isTop3 ? 'rank-row__badge--top3' : ''}`}>
          {item.rank}
        </span>
        <div className="rank-row__info">
          <div className={`rank-row__name ${item.is_me ? 'rank-row__name--me' : ''}`}>
            {item.name}
          </div>
          <div className="subtle rank-row__dept">
            {item.department_name ?? '未分配部门'}
          </div>
        </div>
      </div>
      <div className="rank-row__right">
        <div className="rank-row__score">
          <Icon name="star" size={14} weight="fill" /> {item.total_score}
        </div>
        <div className="rank-row__duration">
          <Icon name="clock" size={14} weight="bold" /> {durationSec} 秒
        </div>
        <ProgressMini percent={progressPercent} />
      </div>
    </>
  );
}
