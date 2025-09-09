/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { LoggerModule } from 'src/common/logger/logger.module';
import { TransactionRepository } from 'src/modules/transaction/repo/transaction.repository';

@Module({
  imports: [PrismaModule,LoggerModule],
  providers: [TransactionService, TransactionRepository],
  controllers: [TransactionController]
})
export class TransactionModule {}
