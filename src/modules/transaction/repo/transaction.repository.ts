/* eslint-disable prettier/prettier */

import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { Transaction } from "@prisma/client"
import {  Injectable, InternalServerErrorException } from "@nestjs/common";
import { AppLogger } from "../../../common/logger/logger.service";

@Injectable()
export class TransactionRepository {
  constructor(
    private readonly logger: AppLogger,
    private readonly prisma: PrismaService,
    
    ) {}

async getAllTransactions(userId: string): Promise<Transaction[] | null> {
    return this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
}

async getSingleTransaction(transactionId: string){
    return this.prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
            transfer: true,
            deposit: true,
            bill: true,
        }
    });
}

async createTransferTransaction(userId: string, amount: number, fee: number, bank: string, accountNumber: string, recipientName: string ){
    try {
        await this.prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
            data: {
                userId,
                type: 'TRANSFER',
                status: "PENDING",
                amount,
                fee,
            },
        });

        await tx.transfer.create({
            data: {
                transactionId: transaction.id,
                amount,
                fee,
                bank,
                accountNumber,
                recipientName,
            },
        });

        return transaction;
        });

    } catch (error) {
        this.logger.error('CREATE_TRANSACTION', error)
        throw new InternalServerErrorException('Creating transaction failed')
    }
}

}
