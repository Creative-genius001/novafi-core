/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { LoggerModule } from 'src/common/logger/logger.module';
import { JwtStrategy } from '../auth/strategy/jwt.strategy';
import { WalletRepository } from './repo/wallet.repo';

@Module({
  imports:[PrismaModule, LoggerModule],
  providers: [WalletService,JwtStrategy, WalletRepository],
  controllers: [WalletController]
})
export class WalletModule {}
