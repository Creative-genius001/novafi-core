/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { BankController } from './bank.controller';
import { BankService } from './bank.service';
import { FlutterwaveModule } from 'src/flutterwave/flutterwave.module';

@Module({
  imports: [FlutterwaveModule],
  controllers: [BankController],
  providers: [BankService]
})
export class BankModule {}
