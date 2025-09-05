/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AppLogger } from 'src/common/logger/logger.service';
import { FlutterwaveService } from 'src/flutterwave/flutterwave.service';
import { BillCategoryCode, CreateBillPayment, RetrieveAccountName } from 'src/flutterwave/types/flutterwave';
import { TransactionRepository } from 'src/modules/transaction/repo/transaction.repository';
import { CreateBillPaymentDto, RetrieveAccountNameDto } from './dto/transaction.dto';

@Injectable()
export class TransactionService {
    constructor(
        private readonly repo: TransactionRepository,
        private readonly flutterwave: FlutterwaveService,
        private readonly logger: AppLogger
    ){}

    async getAllTransactions(userId: string){
        const transactions =  await this.repo.getAllTransactions(userId)

        if (!transactions){
            this.logger.error('WALLET_RETRIEVAL', { userId } )
            throw new InternalServerErrorException('Could not retrive all transactions')
        }

        return transactions;
    }

    async getSingleTransaction(transactionId: string){
        const transaction =  await this.repo.getSingleTransaction(transactionId)

        if (!transaction){
            this.logger.error('WALLET_BALANCE_RETRIEVAL', { transactionId } )
            throw new InternalServerErrorException('Could not retrive transaction')
        }

        return transaction;
    }

    async getBanks(){
        return this.flutterwave.getAllBanks()
    }

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

    async retrieveAccountName(payload: RetrieveAccountNameDto){
        const data: RetrieveAccountName = {
            account_bank: payload.accountBank,
            account_number: payload.accountNumber
        }

        return this.flutterwave.retrieveAccountName(data)
    }
}
