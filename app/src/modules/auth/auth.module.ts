import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../../entities/user.entity';
import { UserLife } from '../../entities/user-life.entity';

/**
 * 认证模块：会话创建（code 换 token）、JWT 签发与校验。
 * 导出 AuthService、JwtModule 供 UsersModule 等依赖“当前用户”的模块使用。
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserLife]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const jwt = config.get<{ secret: string; expiresIn: string }>('jwt')!;
        return { secret: jwt.secret, signOptions: { expiresIn: jwt.expiresIn } };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
