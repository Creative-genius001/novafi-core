/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { CryptoController } from './crypto.controller';
import { LoggerModule } from 'src/common/logger/logger.module';
import { Repository } from '../user/repo/user.repository';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { CryptoRepository } from './repo/crypto.repository';
import { FireblocksService } from './fireblocks/fireblocks.service';

@Module({
  imports: [LoggerModule, PrismaModule],
  providers: [CryptoService, Repository, FireblocksService, CryptoRepository],
  controllers: [CryptoController],
  exports: [CryptoService]
})
export class CryptoModule {}
