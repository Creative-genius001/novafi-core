/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { LoggerModule } from 'src/common/logger/logger.module';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { JwtStrategy } from '../auth/strategy/jwt.strategy';
import { Repository } from 'src/modules/user/repo/user.repository';
import { FlutterwaveModule } from 'src/flutterwave/flutterwave.module';
import { WalletRepository } from '../wallet/repo/wallet.repo';

@Module({
  imports: [PrismaModule, LoggerModule, RedisModule, FlutterwaveModule],
  controllers: [KycController],
  providers: [KycService, JwtStrategy, Repository, WalletRepository],
})
export class KycModule {}