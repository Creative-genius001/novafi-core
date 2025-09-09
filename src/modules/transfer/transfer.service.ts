/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { FlutterwaveService } from 'src/flutterwave/flutterwave.service';
import { BillCategoryCode, CreateBillPayment } from 'src/flutterwave/types/flutterwave';
import { CreateBillPaymentDto } from './dto/transfer.dto';

@Injectable()
export class TransferService {

    constructor(
        private readonly flutterwave: FlutterwaveService
    ){}

     async getBillerInformation(categoryCode: BillCategoryCode){
        return this.flutterwave.getBillerInformation(categoryCode)
    }

    async createBillPayment(payload: CreateBillPaymentDto){
        const data: CreateBillPayment = {
            item_code: payload.itemCode,
            customer_id: payload.customerId,
            callback_url:payload.callbackUrl,
            biller_code: payload.billerCode,
            country: 'NGN',
            amount: payload.amount,
            reference: payload.reference
        }
        return this.flutterwave.createBillPayment(data)
    }
}
