/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { FlutterwaveHttpService } from './http.service';
import { BillCategoryCode, BillPaymentResponse, BillPaymentStatusResponse, CreateBillPayment, CreateVBA, GetBanksResponse, GetBillerInformationResponse, InitiateBvnVerificationResponse, RetrieveAccountName, RetrieveAccountNameResponse, VirtualAccountResponse } from './types/flutterwave';
import { BvnVerificationDto } from 'src/modules/kyc/dto/kyc.dto';

@Injectable()
export class FlutterwaveService {

    constructor(
        private readonly http: FlutterwaveHttpService
    ){}

    async createVirtualAccount(data: CreateVBA): Promise<VirtualAccountResponse>{
        return this.http.post('/virtual-account-numbers', data)
    }

    async getAllBanks(): Promise<GetBanksResponse>{
        return this.http.get('/banks/NG?include_provider_type=1')
    }

    async getBillerInformation(category: BillCategoryCode): Promise<GetBillerInformationResponse>{
        return this.http.get(`/bills/${category}/billers?country=NG`)
    }

    async createBillPayment(data: CreateBillPayment): Promise<BillPaymentResponse>{
        const { biller_code, item_code, ...rest } = data;
        const body = { ...rest }
        return this.http.post(`/billers/${biller_code}/items/${item_code}/payment`, body)
    }

    async getBillPaymentStatus(reference: string): Promise<BillPaymentStatusResponse>{
        return this.http.get(`/bills/${reference}`)
    }

    async retrieveAccountName(data: RetrieveAccountName): Promise<RetrieveAccountNameResponse>{
        return this.http.post('/accounts/resolve', data)
    }

    async initiateBvnVerification(data: BvnVerificationDto): Promise<InitiateBvnVerificationResponse> {
        return this.http.post('/bvn/verifications', data)
    }

    async retrieveBvnInformation(reference: string) {
        const url = `/bvn/verifications/${reference}`
        return this.http.get(url)
    }
}
