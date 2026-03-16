import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttemptsController } from './attempts.controller';
import { AttemptsService } from './attempts.service';
import { Attempt } from '../../entities/attempt.entity';
import { AttemptEvent } from '../../entities/attempt-event.entity';
import { User } from '../../entities/user.entity';
import { UserLevelBest } from '../../entities/user-level-best.entity';
import { PointTransaction } from '../../entities/point-transaction.entity';
import { Level } from '../../entities/level.entity';
import { IdempotencyKey } from '../../entities/idempotency-key.entity';

/**
 * 挑战模块：创建挑战、上报事件、结算（通过时更新 user_level_best、积分、point_transactions）、回放时间线。
 * 创建与结算支持 x-idempotency-key 防重。
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attempt,
      AttemptEvent,
      User,
      UserLevelBest,
      PointTransaction,
      Level,
      IdempotencyKey,
    ]),
  ],
  controllers: [AttemptsController],
  providers: [AttemptsService],
  exports: [AttemptsService],
})
export class AttemptsModule {}
