/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from './common/logger/logger.module';
import { HttpExceptionsFilter } from './common/filters/http-exceptions.filter';
import { AppService } from './app.service';
import { LoggingInterceptor } from './common/interceptor/logging.interceptor';

@Module({
  imports: [LoggerModule],
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
  exports: [LoggerModule],
})
export class AppModule {}
