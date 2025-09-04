/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { AppLogger } from 'src/common/logger/logger.service';
import { Repository } from 'src/infrastructure/prisma/repository/user.repository';
import axios, { AxiosError } from 'axios'
import axiosRetry from 'axios-retry';
import { config } from 'src/config/config';
import { InitiateKycDto } from './dto/kyc.dto';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { KYCStatus } from '@prisma/client';

@Injectable()
export class KycService {
    constructor(
        private readonly logger: AppLogger,
        private readonly repo: Repository,
        private readonly redis: RedisService
    ){
        axiosRetry(axios, {
        retries: 3,
        retryDelay: (retryCount) => retryCount * 1000,
        retryCondition: (error) => {
            return (
                axiosRetry.isNetworkOrIdempotentRequestError(error) ||
                error.response?.status === 429
            );
        }
    })
    }

    async initiateKyc(userId: string, payload: InitiateKycDto){
        this.logger.debug('KYC_INITIATED', {userId, payload})
        const user = await this.repo.findById(userId);
        if (!user) {
            this.logger.warn('User not found for KYC initiation', { userId });
            throw new BadRequestException('User not found');
        }

        let response;
        try {
            response = await axios.post(
            `${config.SUMSUB_BASE_URL}/resources/accessTokens/sdk`,
            {   
                applicationIdentifiers: {
                    email: payload.email,
                    phone: payload.phone
                },
                ttlInSecs: '600',
                userId,
                levelName: 'basic-kyc-level',
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-App-Secret': config.SUMSUB_API_SECRET,
                    'X-App-Token': config.SUMSUB_API_TOKEN,
                },
                timeout: 10000,
            },
            );
            
        } catch (error) {
            const axiosError = error as AxiosError;
            const status = axiosError.response?.status;
            // const sumsubError = axiosError.response?.data;

            this.logger.error('SUMSUB_API_CALL', {
                userId,
                status,
                error: axiosError.cause,
                // errorCode: sumsubError?.code,
                // errorMessage: sumsubError?.message || axiosError.message,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                requestId: axiosError.response?.headers['x-request-id'],
            });

            throw new InternalServerErrorException()
        }

        this.logger.info('SUMSUB_TOKEN', response.data)

        const accessToken = response.data.id as string;

        await this.redis.set(`${userId}:kyc`, JSON.stringify({ accessToken, status: 'PENDING' }), 3600);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        await this.repo.updateKycStatus(userId, KYCStatus.PENDING);

        this.logger.info('Sumsub KYC initiated', { userId, accessToken });
        return { generatedToken: accessToken };
    

    }

    async getKycStatus(userId: string){
        const kycStatus =  await this.repo.getKycStatus(userId)

        return kycStatus;
    }

    async handleKycWebhook(){

    }
}
