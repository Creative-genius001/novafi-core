/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from './common/logger/logger.module';
import { HttpExceptionsFilter } from './common/filters/http-exceptions.filter';
import { AppService } from './app.service';
import { LoggingInterceptor } from './common/interceptor/logging.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { KycModule } from './modules/kyc/kyc.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { UserModule } from './modules/user/user.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { FlutterwaveModule } from './flutterwave/flutterwave.module';
import { BankModule } from './modules/bank/bank.module';
import { TransferModule } from './modules/transfer/transfer.module';

@Module({
  imports: [LoggerModule, AuthModule,  RedisModule.forRootAsync(), KycModule, WalletModule, UserModule, TransactionModule, FlutterwaveModule, BankModule, TransferModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [],
})
export class AppModule {}
