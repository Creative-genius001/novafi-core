/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { BadRequestException, Body, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRepo } from './repo/auth.repo';
import { AppLogger } from 'src/common/logger/logger.service';
import { LoginDto, SignupDto } from './dto/auth.dto';
import *  as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants/constant';
import { ERROR } from 'src/utils/error';
import { SignupResponse } from './interface/auth.interface';

interface JwtPayload {
  sub: string;
  exp: number;
}

@Injectable()
export class AuthService {
  
    constructor(
        private readonly repo: AuthRepo,
        private readonly logger: AppLogger,
        private readonly jwtService: JwtService
    ){}

    async login(payload: LoginDto){
        const { email } = payload;
        const user = await this.repo.findByEmail(email)
        if(!user) {
            throw new BadRequestException('Incorrect credentials')
        };
        const matches = await bcrypt.compare(payload.password, user.password) as boolean;
        if (!matches){
            throw new BadRequestException('Incorrect credentials')
        };

        const tokens = await this.generateTokens(user.id);
        const decoded: JwtPayload = this.jwtService.decode(tokens.refreshToken);
        const expiresAt = new Date(decoded.exp * 1000).toISOString();
        await this.updateRefreshToken(user.id, tokens.refreshToken, expiresAt);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userData } = user;
        return {
        ...userData,
        ...tokens,
        };
    }

    async signup(payload: SignupDto){
        const existingUser = await this.repo.checkEmailExist(payload.email)
        if(existingUser){
            throw new BadRequestException('User already exist')
        }
        
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const hashed = await bcrypt.hash(payload.password, 12) as string;
        payload.password = hashed;
        const newUserPayload = { ...payload, password: hashed };
        const user =  await this.repo.createUser(newUserPayload)

        // const response: SignupResponse = {
        //     userId: user.id,
        //     message: 'Account created successfully. Please verify your account.',
        //     maskedEmail: user.email
        // }
        
        const { password, ...userData } = user;
        return { data: userData };
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
        
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const matches = bcrypt.compare(refreshToken, existingRefreshToken.refreshToken);
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

    async sendOtp(){

    }

    async verifyOtp(){

    }

    async resendOtp(){

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
        const hashed = await bcrypt.hash(refreshToken, 12) as string;
        await this.repo.updateRefreshToken(userId, hashed, expiresAt)
    }
}
