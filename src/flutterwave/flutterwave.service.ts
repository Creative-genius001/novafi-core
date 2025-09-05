/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { FlutterwaveHttpService } from './http.service';
import { BillCategoryCode, CreateBillPayment, CreateVBA } from './types/flutterwave';

@Injectable()
export class FlutterwaveService {

    constructor(
        private readonly http: FlutterwaveHttpService
    ){}

    async createVirtualAccount(data: CreateVBA){
        return this.http.post('/virtual-account-numbers', data)
    }

    async getAllBanks(){
        return this.http.get('/banks/NG?include_provider_type=1')
    }

    async getBillerInformation(category: BillCategoryCode){
        return this.http.get(`/bills/${category}/billers?country=NG`)
    }

    async createBillPayment(data: CreateBillPayment){
        const { biller_code, item_code, ...rest } = data;
        const body = { ...rest }
        return this.http.post(`/billers/${biller_code}/items/${item_code}/payment`, body)
    }

    async getBillPaymentStatus(reference: string){
        return this.http.get(`/bills/${reference}`)
    }
}
