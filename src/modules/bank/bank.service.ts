/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { FlutterwaveService } from 'src/flutterwave/flutterwave.service';
import { RetrieveAccountName } from 'src/flutterwave/types/flutterwave';
import { RetrieveAccountNameDto } from './dto/bank.dto';


@Injectable()
export class BankService {
    constructor(
        private readonly flutterwave: FlutterwaveService
    ){}

    async retrieveAccountName(payload: RetrieveAccountNameDto){
        const data: RetrieveAccountName = {
            account_bank: payload.accountBank,
            account_number: payload.accountNumber
        }

        return this.flutterwave.retrieveAccountName(data)
    }

     async getBanks(){
        return this.flutterwave.getAllBanks()
    }
}
