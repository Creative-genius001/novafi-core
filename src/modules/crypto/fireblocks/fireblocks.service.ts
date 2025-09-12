/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import { AppLogger } from 'src/common/logger/logger.service';
import { Fireblocks } from "@fireblocks/ts-sdk";
import { config } from 'src/config/config';

@Injectable()
export class FireblocksService {
  private readonly fireblocks: Fireblocks

  constructor(
    private readonly logger: AppLogger
  ) {
    this.fireblocks = new Fireblocks({
        apiKey: config.FIREBLOCKS_API_KEY,
        basePath: config.FIREBLOCKS_BASE_PATH,
        secretKey: fs.readFileSync(config.FIREBLOCKS_SECRET_KEY, "utf8")
    })
  }

  async createVaultAccount(name: string): Promise<string | undefined> {
    try {
        const { data } = await this.fireblocks.vaults.createVaultAccount({
            createVaultAccountRequest: {
                name,
                hiddenOnUI: true,
                autoFuel: false
            }
        });

        this.logger.info('VAULT_ACCOUNT_CREATED', data)
   
        return data.id;

    } catch (e) {
        this.logger.error('CREATE_VAULT_ACCOUNT', e)
        throw new InternalServerErrorException('Error occured while creating vault account')
    }
  }

  async generateDepositAddress(vaultId: string, assetId: string): Promise<string | undefined> {
    try {
        const { data } = await this.fireblocks.vaults.createVaultAccountAssetAddress({
            vaultAccountId: vaultId,
            assetId: assetId
        });
        
        this.logger.info('DEPOSIT_ADDRESS_GENERATED', data)

        return data.address;

    } catch (e) {
        this.logger.error('GENERATE_DEPOSIT_ADDRESS', e)
        throw new InternalServerErrorException('Error occured whilegenerating deposit address')
    }
  }
}