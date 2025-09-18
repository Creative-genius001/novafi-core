/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/constant';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { Repository } from '../user/repo/user.repository';
import { LoggerModule } from '../../common/logger/logger.module';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { FlutterwaveModule } from 'src/flutterwave/flutterwave.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
    imports: [
        LoggerModule,
        JwtModule.register({
            global: true,
            secret: jwtConstants.access_token_secret,
            signOptions: { expiresIn: '2d' },
        }),
        PassportModule,
        PrismaModule,
        RedisModule,
        NotificationModule,
        FlutterwaveModule
    ],
  controllers: [AuthController],
  providers: [ Repository, AuthService, JwtStrategy ],
})
export class AuthModule {}
