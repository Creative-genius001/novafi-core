/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AppLogger } from 'src/common/logger/logger.service';
import { WalletRepository } from 'src/infrastructure/prisma/repository/wallet.repository';

@Injectable()
export class WalletService {

    constructor(
        private readonly repo: WalletRepository,
        private readonly logger: AppLogger
    ){}

    async getWallet(userId: string){
        const wallet =  await this.repo.getWallet(userId)

        if (!wallet){
            this.logger.error('WALLET_RETRIEVAL', { userId } )
            throw new InternalServerErrorException('Could not retrive wallet')
        }

        return wallet;
    }

    async getBalance(userId: string){
        const balance =  await this.repo.getBalance(userId)

        if (!balance){
            this.logger.error('WALLET_BALANCE_RETRIEVAL', { userId } )
            throw new InternalServerErrorException('Could not retrive wallet balance')
        }

        return balance;
    }
}
