/* eslint-disable prettier/prettier */
import { BadRequestException, Body, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from './repository/auth.repository';
import { AppLogger } from 'src/common/logger/logger.service';
import { LoginDto, SignupDto, VerifyOtpDto } from './dto/auth.dto';
import *  as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants/constant';
import { ERROR } from 'src/utils/error';
import { SignupResponse } from './interface/auth.interface';
import { generateSecureOTP } from 'src/utils/otp.utils';
import { RedisService } from 'src/infrastructure/redis/redis.service';

interface JwtPayload {
  sub: string;
  exp: number;
}

@Injectable()
export class AuthService {
  
    constructor(
        private readonly logger: AppLogger,
        private readonly jwtService: JwtService,
        private readonly repo: AuthRepository,
        private readonly redis: RedisService,
    ){}

    async login(payload: LoginDto, userAgent: string, ip: string){
        const { email } = payload;
        const user = await this.repo.findByEmail(email)
        if(!user) {
            throw new BadRequestException('Incorrect credentials')
        };
        const matches = await bcrypt.compare(payload.password, user.password);
        if (!matches){
            throw new BadRequestException('Incorrect credentials')
        };

        const tokens = await this.generateTokens(user.id);
        const decoded: JwtPayload = this.jwtService.decode(tokens.refreshToken);
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
        const newUserPayload = { ...payload, password: hashed };
        const user =  await this.repo.createUser(newUserPayload)
        
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
            maskedEmail: user.email
        }

        const otp = generateSecureOTP()
        this.logger.info('OTP-CODE', { otp })
        await this.redis.set(`otp:${user.id}`, otp, 60);
        return { response };
    }

    async refreshAccessToken(userId: string, refreshToken: string){

        const secret = jwtConstants.refresh_token_secret
        try {
            const decoded: JwtPayload = await this.jwtService.verifyAsync(refreshToken, { secret });
            if (decoded.sub !== userId) {
                throw new ForbiddenException(ERROR.FORBIDDEN);
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        const existingRefreshToken: {
            refreshToken: string | null;
            expiresAt: string | null;
        } | null = await this.repo.getRefreshToken(userId);

        if(!existingRefreshToken || existingRefreshToken.refreshToken === null){
            throw new UnauthorizedException('Invalid refresh token')
        }
        
        const matches = await bcrypt.compare(refreshToken, existingRefreshToken.refreshToken);
        if (!matches){
            throw new ForbiddenException(ERROR.FORBIDDEN)
        };
      
        if (!existingRefreshToken.expiresAt || new Date(existingRefreshToken.expiresAt) < new Date()) {
            throw new UnauthorizedException('Refresh token expired');
        }
        
        const payload = this.getAccessTokenPayload(userId);
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: jwtConstants.access_token_secret,
            expiresIn: '2d',
        });

        return {accessToken, refreshToken};
    }

    async sendOtptoEmail(){

    }

    async verifyOtp(payload: VerifyOtpDto){
        const key = `otp:${payload.userId}`;
        const storedOtp = await this.redis.get(key);
        if (!storedOtp || storedOtp !== payload.otp) {
            throw new BadRequestException('OTP is invalid or expired');
        }

    
        await this.repo.updateIsVerified(payload.userId);

        await this.redis.del(key);

        return { isVerified: true };
    }

    async resendOtp(userId: string){
        const otp = generateSecureOTP()
        return await this.redis.set(`otp:${userId}`, otp, 60);
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
        const hashed = await bcrypt.hash(refreshToken, 12);
        await this.repo.updateRefreshToken(userId, hashed, expiresAt)
    }
}
