/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { AppLogger } from 'src/common/logger/logger.service';
import { Repository } from 'src/modules/user/repo/user.repository';
import axios, { AxiosError } from 'axios'
import axiosRetry from 'axios-retry';
import { config } from 'src/config/config';
import { BvnVerificationDto, InitiateKycDto } from './dto/kyc.dto';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import {  KycStatus } from 'src/types/types';
import { FlutterwaveService } from 'src/flutterwave/flutterwave.service';
import { BvnRecord, BvnVerificationResponse, InitiateBvnVerificationResponse } from './interface/kyc.interface';
import { CreateVBA } from 'src/flutterwave/types/flutterwave';
import { generateTxRef } from 'src/utils/utils';
import { WalletRepository } from '../wallet/repo/wallet.repo';

@Injectable()
export class KycService {
    constructor(
        private readonly logger: AppLogger,
        private readonly repo: Repository,
        private readonly redis: RedisService,
        private readonly flutterwave: FlutterwaveService,
        private readonly walletRepository: WalletRepository
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

       
        const status = KycStatus.PENDING;

        await this.repo.updateKycStatus(userId, status);

        this.logger.info('Sumsub KYC initiated', { userId, accessToken });
        return { generatedToken: accessToken };
    

    }

    async getKycStatus(userId: string){
        return  await this.repo.checkKycStatus(userId)
    }

    async handleKycWebhook(){

    }

    async verifyBvnNumber(userId: string, payload: BvnVerificationDto) {

        const user = await this.repo.findById(userId);
        if (!user) throw new BadRequestException();

        const initiateData = await this.flutterwave.initiateBvnVerification(payload) as InitiateBvnVerificationResponse;

        const verificationData = await this.flutterwave.retrieveBvnInformation(initiateData.data.reference) as BvnVerificationResponse;

        if(verificationData.data.status != 'COMPLETED') {
            throw new BadRequestException('verification failed')
        }

        const { first_name, last_name, bvn_data, reference } = verificationData.data
        const { middleName, bvn, dateOfBirth, email, phoneNumber2, gender, nin, faceImage  } = bvn_data

        const bvnRecord: BvnRecord = {
            firstName: first_name,
            lastName: last_name,
            bvnReference: reference,
            middleName,
            bvn,
            dateOfBirth,
            email,
            phoneNumber: phoneNumber2,
            gender,
            nin,
            faceImageUrl: faceImage
        }

        await this.repo.createBvnRecord(userId, bvnRecord)

        const txRef = generateTxRef();
        const narration = 'Static VA for customer wallet funding'

        this.logger.info('TX_REF', {
            email: user.email,
            txRef,
            userId,
            bvn
        })

        const virtualAccountData : CreateVBA = {
            email: user.email,
            tx_ref: txRef,
            phonenumber: user.phone,
            is_permanent: true,
            firstname: user.firstname,
            lastname: user.lastname,
            narration,
            bvn,
            currency: 'NGN',
            amount: 0.00
        }

        const vba = await this.flutterwave.createVirtualAccount(virtualAccountData);

        const { account_number, bank_name, order_ref } = vba.data

        await this.walletRepository.updateWalletDetails(userId, bank_name, account_number, order_ref)

        const response = {
            message: "Your VBA has been created",
            bankName: bank_name,
            accountNumber: account_number,
            verified: "success"
        }

        return response;
    }
}
