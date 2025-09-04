/* eslint-disable prettier/prettier */

import { PrismaService } from "../prisma.service";
import { Wallet } from "@prisma/client"
import {  Injectable } from "@nestjs/common";
import { AppLogger } from "../../../common/logger/logger.service";

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

}
