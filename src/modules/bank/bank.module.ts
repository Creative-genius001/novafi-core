/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { BankController } from './bank.controller';
import { BankService } from './bank.service';
import { FlutterwaveModule } from 'src/flutterwave/flutterwave.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [FlutterwaveModule, NotificationModule],
  controllers: [BankController],
  providers: [BankService]
})
export class BankModule {}
