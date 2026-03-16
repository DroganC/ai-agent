import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardsController } from './leaderboards.controller';
import { LeaderboardsService } from './leaderboards.service';
import { User } from '../../entities/user.entity';

/**
 * 排行榜模块：按 total_score 降序、best_duration_ms 升序分页查询用户列表，支持 scope/game_id/department_id 等筛选（当前实现为全局分页）。
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [LeaderboardsController],
  providers: [LeaderboardsService],
  exports: [LeaderboardsService],
})
export class LeaderboardsModule {}
