import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LeaderboardsService } from './leaderboards.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { parsePage, parseLimit, parseOptionalInt } from '../../common/utils/parse-query';
import { sanitizeSearchKeyword } from '../../common/utils/sanitize-search-keyword';

/**
 * 排行榜控制器：GET /leaderboards，解析 scope、game_id、department_id、page、page_size 后调用 Service。
 */
@Controller('leaderboards')
@UseGuards(JwtAuthGuard)
export class LeaderboardsController {
  constructor(private readonly leaderboardsService: LeaderboardsService) {}

  @Get()
  async getLeaderboard(
    @CurrentUser() payload: JwtPayload,
    @Query('scope') scope?: string,
    @Query('game_id') gameId?: string,
    @Query('department_id') departmentId?: string,
    @Query('page') page?: string,
    @Query('page_size') pageSize?: string,
    @Query('name') name?: string,
  ) {
    const keyword = sanitizeSearchKeyword(name);
    return this.leaderboardsService.getLeaderboard(
      payload.sub,
      scope,
      parseOptionalInt(gameId),
      parseOptionalInt(departmentId),
      parsePage(page),
      parseLimit(pageSize),
      keyword,
    );
  }
}
