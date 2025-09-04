/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { LoggerModule } from 'src/common/logger/logger.module';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { JwtStrategy } from '../auth/strategy/jwt.strategy';
import { Repository } from 'src/infrastructure/prisma/repository/user.repository';

@Module({
  imports: [PrismaModule, LoggerModule, RedisModule],
  controllers: [KycController],
  providers: [KycService, JwtStrategy, Repository],
})
export class KycModule {}