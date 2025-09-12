/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Repository } from '../user/repo/user.repository';
import { FireblocksService } from './fireblocks/fireblocks.service';
import { DepositAddress } from './interface/fireblocks.interface';
import { CryptoRepository } from './repo/crypto.repository';

@Injectable()
export class CryptoService {

    constructor(
        private readonly userRepository: Repository,
        private readonly fireblocks: FireblocksService,
        private readonly cryptoRepository: CryptoRepository,
    ){}

    async getDepositAddress (userId: string, cryptoType: string, network: string) {
    //check if user is verified
        const user = await this.userRepository.findById(userId);
        if(!user?.isEmailVerified) throw new BadRequestException('user not verified')
    //validate cryptoType and compatibility

    //check if user already has a vault id
        if(!user.fireblocksVaultId || user.fireblocksVaultId === null){

            const vaultId = await this.fireblocks.createVaultAccount(`Vault account for id: ${userId}`)
            if(!vaultId) throw new InternalServerErrorException('vault id is undefined')
            
            const address = await this.fireblocks.generateDepositAddress(vaultId, cryptoType)
            if(!address) throw new InternalServerErrorException('address is undefined')

            const depositAddress: DepositAddress = {
                cryptoType,
                network,
                address,
                isActive: true
            }

            const response = await this.cryptoRepository.createDepositAddressAndUpdateVaultId(userId, vaultId, depositAddress)

            return response;

        } else {
            //check if deposit address already exist (if it does then return address) else 
            const depositAddress = await this.cryptoRepository.getDepositAddress(userId, cryptoType, network)
            if(!depositAddress){
                const address = await this.fireblocks.generateDepositAddress(user.fireblocksVaultId, cryptoType)
                if(!address) throw new InternalServerErrorException('address is undefined')

                const depositAddress: DepositAddress = {
                    cryptoType,
                    network,
                    address,
                    isActive: true
                }

                const response = await this.cryptoRepository.createDepositAddress(userId, depositAddress)

                return response;
            }

            return depositAddress;
        }
    
    }
    
}
