/* eslint-disable prettier/prettier */
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Repository } from '../user/repo/user.repository';
import { AppLogger } from 'src/common/logger/logger.service';
import { LoginDto, ResendOtpDto, SignupDto, StartEmailChangeDto, VerifyOtpDto, VerifyPasswordChangeDto } from './dto/auth.dto';
import *  as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants/constant';
import { ERROR } from 'src/utils/error';
import { SignupResponse } from './interface/auth.interface';
import { generateSecureOTP, generateNovaId } from 'src/utils/utils';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { maskEmail } from 'src/utils/maskEmail.utils';
import { changeEmailOtp, sendSigupOtp } from './nodemailer/nodemailer';
import { RedisLockService } from 'src/infrastructure/redis/redis-lock.service';
import { hashOtp, verifyOtpHash, withinCooldown } from './helper/helper';

interface JwtPayload {
  sub: string;
  exp: number;
}

@Injectable()
export class AuthService {
    
    private readonly maxRetries: number = 3;
    private readonly EMAIL_CHG_KEY = (userId: string) => `emailchg:${userId}`;
    private readonly PWD_CHG_KEY   = (userId: string) => `pwdchg:${userId}`;
    private readonly DAYS_LIMIT = 21;


    constructor(
        private readonly logger: AppLogger,
        private readonly jwtService: JwtService,
        private readonly repo: Repository,
        private readonly redis: RedisService,
        private readonly redisLock: RedisLockService,
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
            isEmailVerified: user.isEmailVerified,
            isKycVerified: user.isKycVerified,
            novaId: user.novaId,
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

        await sendSigupOtp(user.email, otp)

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

    
        await this.repo.updateEmailStatus(payload.userId);

        await this.redis.del(key);

        return { isVerified: true };
    }

    async resendOtp(payload: ResendOtpDto){
        const otp = generateSecureOTP()
        await this.redis.set(`otp:${payload.userId}`, otp, 60);

        await sendSigupOtp(payload.email, otp)

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
        
        let retries = 0;

        while (retries < this.maxRetries) {
            const novaId = generateNovaId();

            const exist = await this.redis.sisMember(usedNovaIdKey, novaId)

            if (exist === 0) {
                
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

    async startEmailChange(userId: string, payload: StartEmailChangeDto) {
        
        const { password, newEmail } = payload;

        const throttleKey = `${this.EMAIL_CHG_KEY(userId)}:count`;
        const count = await this.redis.incr(throttleKey);
        if (count === 1) await this.redis.expire(throttleKey, 3600);
        if (count > 3) {
            throw new BadRequestException('Too many attempts, try later');
        }

        const user = await this.repo.retrivePassword(userId);
        if (!user) throw new ForbiddenException(ERROR.FORBIDDEN);

    
        if (user.lastEmailChangeAt && withinCooldown(user.lastEmailChangeAt, this.DAYS_LIMIT)) {
            const nextDate = new Date(user.lastEmailChangeAt.getTime() + this.DAYS_LIMIT * 86400000);
            throw new BadRequestException(`Email can only be changed again after ${nextDate.toDateString()}`);
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) throw new BadRequestException('Invalid current password');

        const existing = await this.repo.findByEmail(newEmail);
        if (existing) throw new BadRequestException('Email already in use');


        const otp = generateSecureOTP();
        const otpHash = await hashOtp(otp);

        await this.redis.set(
        this.EMAIL_CHG_KEY(userId),
            JSON.stringify({ otpHash, attempts: 0, targetEmail: newEmail }),
            6000, 
        );

        await changeEmailOtp(newEmail, otp)

        return { message: 'OTP sent to new email' };
    }

    async verifyEmailChange(userId: string, otp: string) {

        const raw = await this.redis.get(this.EMAIL_CHG_KEY(userId));
        if (!raw) throw new BadRequestException('Otp expired');

        const payload = JSON.parse(raw) as { otpHash: string; attempts: number; targetEmail: string };
        if (payload.attempts >= 3) {
            throw new BadRequestException('Too many attempts');
        }

        const ok = await verifyOtpHash(payload.otpHash, otp);
        if (!ok) {
            payload.attempts += 1;
            await this.redis.set(this.EMAIL_CHG_KEY(userId), JSON.stringify(payload), 10 * 60);
            throw new BadRequestException('Invalid otp code');
        }

        //include a transaction to update audit logs later
        const updated = await this.repo.updateEmail(userId, payload.targetEmail)

        await this.redis.del(this.EMAIL_CHG_KEY(userId));

        return {...updated, message: "Email updated"};
    }

    async startPasswordChange(userId: string, currentPassword: string) {

        const throttleKey = `${this.PWD_CHG_KEY(userId)}:count`;
        const count = await this.redis.incr(throttleKey);
        if (count === 1) await this.redis.expire(throttleKey, 3600);
        if (count > 3) {
            await this.redis.del(throttleKey)
            throw new BadRequestException('Too many attempts, try later');
        }

        const user = await this.repo.retrivePassword(userId);
        if (!user) throw new ForbiddenException(ERROR.FORBIDDEN);

        if (user.lastPasswordChangeAt && withinCooldown(user.lastPasswordChangeAt, this.DAYS_LIMIT)) {
            const nextDate = new Date(user.lastPasswordChangeAt.getTime() + this.DAYS_LIMIT * 86400000);
            throw new BadRequestException(`Email can only be changed again after ${nextDate.toDateString()}`);
        }

        const ok = await bcrypt.compare(currentPassword, user.password);
        if (!ok) throw new BadRequestException('Invalid current password');


        const otp = generateSecureOTP();
        const otpHash = await hashOtp(otp);

        await this.redis.set(
        this.PWD_CHG_KEY(userId),
            JSON.stringify({ otpHash, attempts: 0 }),
            10 * 60, 
        );

        await changeEmailOtp(user.email, otp)

        return { message: 'OTP sent to new email' };
    }

    async verifyPasswordChange(userId: string, body: VerifyPasswordChangeDto) {

        const { otp, newPassword } = body;

        const raw = await this.redis.get(this.PWD_CHG_KEY(userId));
        if (!raw) throw new BadRequestException('Otp expired');

        const payload = JSON.parse(raw) as { otpHash: string; attempts: number; };
        if (payload.attempts >= 3) {
            await this.redis.del(this.PWD_CHG_KEY(userId));
            throw new BadRequestException('Too many attempts');
        }

        const ok = await verifyOtpHash(payload.otpHash, otp);
        if (!ok) {
            payload.attempts += 1;
            await this.redis.set(this.PWD_CHG_KEY(userId), JSON.stringify(payload), 10 * 60);
            throw new BadRequestException('Invalid otp code');
        }

        //include a transaction to update audit logs later
        await this.repo.updatePassword(userId, newPassword)

        await this.redis.del(this.EMAIL_CHG_KEY(userId));

        return {
            message: "Password updated"
        };
    }
}
