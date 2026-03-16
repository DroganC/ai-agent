import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ScenesModule } from './modules/scenes/scenes.module';
import { LevelsModule } from './modules/levels/levels.module';
import { AttemptsModule } from './modules/attempts/attempts.module';
import { LeaderboardsModule } from './modules/leaderboards/leaderboards.module';
import { LearningModule } from './modules/learning/learning.module';
import { StoreModule } from './modules/store/store.module';

/**
 * 根模块：仅负责聚合各功能模块与全局配置，不包含业务逻辑。
 * 目录约定：config/ 统一配置，common/ 共享能力，database/ 数据层，entities/ 实体，modules/ 下为各领域模块。
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      load: [configuration],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ScenesModule,
    LevelsModule,
    AttemptsModule,
    LeaderboardsModule,
    LearningModule,
    StoreModule,
  ],
})
export class AppModule {}
