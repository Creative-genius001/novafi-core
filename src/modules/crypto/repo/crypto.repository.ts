/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { AppLogger } from "src/common/logger/logger.service";
import { PrismaService } from "src/infrastructure/prisma/prisma.service";
import { DepositAddress } from "../interface/fireblocks.interface";



@Injectable()
export class CryptoRepository {
  constructor(
    private readonly logger: AppLogger,
    private readonly prisma: PrismaService,
    
    ) {}

    async getDepositAddress (userId: string, cryptoType: string, network: string) {
        return await this.prisma.depositAddress.findUnique({
        where: { userId_cryptoType_network: { userId, cryptoType, network } }
        })
    }

    async createDepositAddress( userId: string, data: DepositAddress) {
        return await this.prisma.depositAddress.create({
            data: {
                userId,
                address: data.address,
                cryptoType: data.cryptoType,
                network: data.network,
                isActive: data.isActive
            }
        })
    }
    
    async createDepositAddressAndUpdateVaultId(userId: string, vaultId: string, data: DepositAddress) {
        const { address, network, cryptoType, isActive } = data;
        
        try {
            const result = await this.prisma.$transaction(async (tx) => {
            const depositAddress =  await tx.depositAddress.create({
            data: {
                userId,
                network,
                cryptoType,
                address,
                isActive
                },
            });

            await tx.user.update({
                where: { id : userId },
                data: {
                    fireblocksVaultId: vaultId,
                },
            });

            
            return depositAddress;

            })

            return result;
            
        } catch (error) {

            this.logger.error('CREATE_AND_UPDATE_ADDRESS_VAULT_ID', error);
            throw new InternalServerErrorException('Something went wrong with transaction while creating address and updating fireblockVaultId');
        }
    }
}