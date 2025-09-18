/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { FlutterwaveService } from 'src/flutterwave/flutterwave.service';
import { RetrieveAccountName } from 'src/flutterwave/types/flutterwave';
import { RetrieveAccountNameDto } from './dto/bank.dto';
import { NotificationService } from '../notification/notification.service';
import { NotificationTitle } from '../notification/interface/notification.interface';


@Injectable()
export class BankService {
    constructor(
        private readonly flutterwave: FlutterwaveService,
        private readonly notificationService: NotificationService
    ){}

    async retrieveAccountName(payload: RetrieveAccountNameDto){
        const data: RetrieveAccountName = {
            account_bank: payload.accountBank,
            account_number: payload.accountNumber
        }

        return this.flutterwave.retrieveAccountName(data)
    }

     async getBanks(){

        await this.notificationService.queueNotification("b3ac3e01-38d7-4bd9-be2f-cf6e171b6589", 'SERVICES', 'AIRTIME_SUCCESS', NotificationTitle.AIRTIME_SUCCESS, 'TRANSACTION', {
            amount: '20,000',
            phoneNumber: '+23481782092772',
            network: 'MTN',
            date: new Date().toISOString()
        })
        

        // return this.flutterwave.getAllBanks()
    }
}
