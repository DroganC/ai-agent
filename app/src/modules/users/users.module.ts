import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { User } from '../../entities/user.entity';
import { UserLife } from '../../entities/user-life.entity';
import { PointTransaction } from '../../entities/point-transaction.entity';
import { StoreOrder } from '../../entities/store-order.entity';
import { StoreItem } from '../../entities/store-item.entity';
import { LearningRecord } from '../../entities/learning-record.entity';
import { LearningMaterial } from '../../entities/learning-material.entity';
import { IdempotencyKey } from '../../entities/idempotency-key.entity';

/**
 * 用户模块：当前用户信息、积分流水、生命值、复活、订单、学习记录。
 * 依赖 AuthModule 获取 UserInfo；所有路由均在 /users/me 下，需 JWT。
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserLife,
      PointTransaction,
      StoreOrder,
      StoreItem,
      LearningRecord,
      LearningMaterial,
      IdempotencyKey,
    ]),
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
