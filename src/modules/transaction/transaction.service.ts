/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AppLogger } from 'src/common/logger/logger.service';
import { TransactionRepository } from 'src/infrastructure/prisma/repository/transaction.repository';

@Injectable()
export class TransactionService {
    constructor(
        private readonly repo: TransactionRepository,
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
}
