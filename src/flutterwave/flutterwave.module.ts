/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { FlutterwaveService } from './flutterwave.service';
import { LoggerModule } from 'src/common/logger/logger.module';
import { HttpModule } from '@nestjs/axios';
import { FlutterwaveHttpService } from './http.service';

@Module({
  imports: [
    LoggerModule,
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
      baseURL: 'https://api.flutterwave.com/v3'
    }),
  ],
  providers: [FlutterwaveService, FlutterwaveHttpService]
})
export class FlutterwaveModule {}
