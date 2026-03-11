import type { Level, LevelModule, Scene } from '../../../types/api';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../icons';
import { Button } from '../../../components/common/Button';
import { Tag } from 'antd-mobile';

export type LevelListItemProps = {
  /** 关卡/游戏数据 */
  level: Level;
  /** 场景列表，用于解析所属场景 */
  scenes: Scene[];
  /** 模块列表，用于解析所属模块 */
  modules: LevelModule[];
};

function getSceneAndModuleNames(
  level: Level,
  scenes: Scene[],
  modules: LevelModule[]
): { sceneName: string; moduleName: string } {
  const module = modules.find((m) => m.id === level.module_id);
  const scene = module ? scenes.find((s) => s.id === module.scene_id) : null;
  return {
    sceneName: scene?.name ?? '—',
    moduleName: module?.name ?? '—',
  };
}

/**
 * 关卡卡片：名称、所属场景/所属模块、难度/时长/积分、解锁状态、开始挑战
 */
export function LevelListItem({ level, scenes, modules }: LevelListItemProps) {
  const navigate = useNavigate();
  const locked = !level.unlocked;
  const { sceneName, moduleName } = getSceneAndModuleNames(level, scenes, modules);

  return (
    <div className={`level-card ${locked ? 'level-card--locked' : ''}`}>
      <div className="level-card__header">
        <h3 className="level-card__title">{level.name}</h3>
        <Tag
          color={locked ? 'default' : 'success'}
          fill="outline"
          className="level-card__status"
        >
          {locked ? '未解锁' : '已解锁'}
        </Tag>
      </div>
      <div className="level-card__belong">
        所属场景：{sceneName} · 所属模块：{moduleName}
      </div>
      <div className="level-card__meta">
        <span className="level-card__meta-item">
          <Icon name="star" size={12} weight="fill" /> {level.reward_points} 积分
        </span>
        <span className="level-card__meta-sep" aria-hidden />
        <span className="level-card__meta-item">
          <Icon name="clock" size={12} weight="bold" /> {level.estimated_seconds ?? '--'}s
        </span>
        <span className="level-card__meta-sep" aria-hidden />
        <span className="level-card__meta-item">难度 {level.difficulty} ★</span>
      </div>
      <div className="level-card__footer">
        <Button
          full
          variant={locked ? 'secondary' : 'primary'}
          onClick={() => !locked && navigate(`/level/${level.id}/prepare`)}
          disabled={locked}
        >
          <span className="level-card__btn-inner">
            {locked ? '未解锁' : '开始挑战'}
            <Icon name="caretRight" size={14} weight="bold" />
          </span>
        </Button>
      </div>
    </div>
  );
}
