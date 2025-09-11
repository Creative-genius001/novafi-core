/* eslint-disable prettier/prettier */


import { Wallet } from "@prisma/client"
import {  Injectable } from "@nestjs/common";
import { AppLogger } from "../../../common/logger/logger.service";
import { PrismaService } from "src/infrastructure/prisma/prisma.service";


@Injectable()
export class WalletRepository {
  constructor(
    private readonly logger: AppLogger,
    private readonly prisma: PrismaService,
    
    ) {}

async getWallet(userId: string): Promise<Wallet | null> {
    return this.prisma.wallet.findUnique({
        where: { userId }
    });
}

async getBalance(userId: string){
    return this.prisma.wallet.findUnique({
        where: { userId },
        select: { balance: true }
    });
}

async updateWalletBalance(userId: string, amount: number){
    return this.prisma.wallet.update({
        where: { userId },
        data: {
            balance: amount
        }
    })
}

async updateWalletDetails(userId: string, bankName: string, accountNumber: string, orderRef: string) {
    return this.prisma.wallet.update({
        where: { userId },
        data: {
            accountNumber,
            bankName,
            orderRef
        }
    })
}

}