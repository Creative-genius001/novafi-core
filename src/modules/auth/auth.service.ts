/* eslint-disable prettier/prettier */
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Repository } from '../../infrastructure/prisma/repository/user.repository';
import { AppLogger } from 'src/common/logger/logger.service';
import { LoginDto, ResendOtpDto, SignupDto, VerifyOtpDto } from './dto/auth.dto';
import *  as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants/constant';
import { ERROR } from 'src/utils/error';
import { SignupResponse } from './interface/auth.interface';
import { generateSecureOTP, generateNovaId } from 'src/utils/utils';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { maskEmail } from 'src/utils/maskEmail.utils';
import { sendOtpEmail } from './nodemailer/nodemailer';
import { RedisLockService } from 'src/infrastructure/redis/redis-lock.service';

interface JwtPayload {
  sub: string;
  exp: number;
}

@Injectable()
export class AuthService {
  
    constructor(
        private readonly logger: AppLogger,
        private readonly jwtService: JwtService,
        private readonly repo: Repository,
        private readonly redis: RedisService,
        private readonly redisLock: RedisLockService,
        private readonly maxRetries: number = 3,
    ){}

    async login(payload: LoginDto, userAgent: string, ip: string){
        const { email } = payload;
        const user = await this.repo.findByEmail(email)
        if(!user) {
            throw new UnauthorizedException('Incorrect credentials')
        };
        const matches = await bcrypt.compare(payload.password, user.password);
        if (!matches){
            throw new UnauthorizedException('Incorrect credentials')
        };

        const tokens = await this.generateTokens(user.id);

        const decoded: JwtPayload = this.jwtService.decode(tokens.refreshToken);
        if (!decoded || typeof decoded === 'string' || typeof decoded.exp !== 'number') {
            this.logger.error('JWT_DECODE_FAILED', { tokenType: 'refresh' });
            throw new InternalServerErrorException('JWT_DECODE_FAILED');
        }

        const expiresAt = new Date(decoded.exp * 1000).toISOString();

        await this.updateRefreshToken(user.id, tokens.refreshToken, expiresAt);

        this.logger.info('USER_LOGGED_IN', {
            userId: user.id,
            email: user.email,
            ip,
            userAgent,
            timestamp: new Date().toISOString(),
        })

        const userData = {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            phone: user.phone,
            isVerified: user.isVerified,
            kycLevel: user.kycLevel,
            twoFaEnabled: user.twoFaEnabled,
            twoFaSecret: user.twoFaSecret,
            referralCode: user.referralCode,
            referredBy: user.referredBy,
            refreshToken: tokens.refreshToken,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            accessToken: tokens.accessToken
        }
        return { userData  };
    }

    async signup(payload: SignupDto, userAgent: string, ip: string){
        const existingUser = await this.repo.checkEmailExist(payload.email)
        if(existingUser){
            throw new BadRequestException('User already exist')
        }
        
        const hashed = await bcrypt.hash(payload.password, 12);
        payload.password = hashed;

        const novaId = await this.generateUniqueAccountId(payload.email)

        const newUserPayload = { ...payload, password: hashed, novaId };

        const user =  await this.repo.createUser(newUserPayload)

        const maskedEmail = maskEmail(user.email)
        
        this.logger.info('USER_REGISTERED', {
            userId: user.id,
            email: user.email,
            ip,
            userAgent,
            timestamp: new Date().toISOString(),
        })
        const response: SignupResponse = {
            userId: user.id,
            message: 'Account created successfully. Please verify your account.',
            email: user.email,
            maskedEmail
        }

        const otp = generateSecureOTP()
        await this.redis.set(`otp:${user.id}`, otp, 60);

        await sendOtpEmail(user.email, otp)

        return { response };
    }

    async refreshAccessToken(refreshToken: string){
        const secret = jwtConstants.refresh_token_secret;
        let userId = '';
        try {
            const decoded: JwtPayload = await this.jwtService.verifyAsync(refreshToken, { secret });
            userId = decoded.sub
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const stored: {
            refreshToken: string | null;
            expiresAt: string | null;
        } | null = await this.repo.getRefreshToken(userId);

        this.logger.debug('REFRESH TOKEN', stored)
        if(!stored || stored.refreshToken === null){
            throw new UnauthorizedException('Invalid refresh token')
        }
        
        if(refreshToken != stored.refreshToken){
            throw new ForbiddenException(ERROR.FORBIDDEN)
        }
      
        if (!stored.expiresAt || new Date(stored.expiresAt) < new Date()) {
            throw new UnauthorizedException('Refresh token expired');
        }
        
        const tokens = await this.generateTokens(userId);
        this.logger.debug('NEW TOKENS', tokens)

        const decoded: JwtPayload = this.jwtService.decode(tokens.refreshToken);
        if (!decoded || typeof decoded === 'string' || typeof decoded.exp !== 'number') {
            this.logger.error('JWT_DECODE_FAILED', { tokenType: 'refresh' });
            throw new InternalServerErrorException('JWT_DECODE_FAILED');
        }

        const expiresAt = new Date(decoded.exp * 1000).toISOString();

        await this.updateRefreshToken(userId, tokens.refreshToken, expiresAt);

        return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken};
    }

    async verifyOtp(payload: VerifyOtpDto){
        const key = `otp:${payload.userId}`;
        const storedOtp = await this.redis.get(key);
        if (!storedOtp || storedOtp !== payload.otp) {
            throw new UnauthorizedException('OTP is invalid or expired');
        }

    
        await this.repo.updateIsVerified(payload.userId);

        await this.redis.del(key);

        return { isVerified: true };
    }

    async resendOtp(payload: ResendOtpDto){
        const otp = generateSecureOTP()
        await this.redis.set(`otp:${payload.userId}`, otp, 60);

        await sendOtpEmail(payload.email, otp)

        return { message: 'Verication code has been sent to your email' }
    }

    private getAccessTokenPayload(userId: string) {
        return { sub: userId };
    }


    private async generateTokens(userId: string) {
        const payload = this.getAccessTokenPayload(userId);

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: jwtConstants.access_token_secret,
            expiresIn: '2d',
        });

        const refreshToken = await this.jwtService.signAsync({ sub: userId }, {
            secret: jwtConstants.refresh_token_secret,
            expiresIn: '7d',
        });

        return { accessToken, refreshToken };
    }

    private async updateRefreshToken(userId: string, refreshToken: string, expiresAt: string) {
        await this.repo.updateRefreshToken(userId, refreshToken, expiresAt)
    }

    private async generateUniqueAccountId(email: string): Promise<string> {
        const lockKey = `nova-id-lock:${email}`;
        const usedNovaIdKey = 'used_nova_ids'

        try {
        
        const lock = await this.redisLock.lock(lockKey, 15000);
        this.logger.debug('Acquired lock for account ID generation');
        
        let retries = 0;

        while (retries < this.maxRetries) {
            const novaId = generateNovaId();

            const exist = await this.redis.sisMember(usedNovaIdKey, novaId)

            if (exist === 0) {
                this.logger.debug('Released lock for account ID generation');
                
                await this.redis.saad(usedNovaIdKey, novaId)

                await this.redisLock.release(lock)

                this.logger.info('Generated unique nova ID', { novaId });

                return novaId;
            }

            this.logger.warn('NOVA_ID_EXIST', { novaId });
            retries++;

        }

            this.logger.error('Failed to generate unique account ID after max retries', { email, maxRetries: this.maxRetries });
            throw new InternalServerErrorException('Unable to generate unique account ID');
        
        } catch (error) {
            this.logger.error('Failed to generate account ID', error);
            throw new InternalServerErrorException('Failed to generate unique account ID');
        }
  }
}
