/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TransferController } from './transfer.controller';
import { TransferService } from './transfer.service';
import { FlutterwaveModule } from 'src/flutterwave/flutterwave.module';

@Module({
  imports: [FlutterwaveModule],
  controllers: [TransferController],
  providers: [TransferService]
})
export class TransferModule {}
