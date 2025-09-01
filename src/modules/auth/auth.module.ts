/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/constant';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthRepo } from './repo/auth.repo';
import { LoggerModule } from 'src/common/logger/logger.module';

@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: jwtConstants.access_token_secret,
            signOptions: { expiresIn: '2d' },
        }),
        PassportModule,
        LoggerModule
    ],
  controllers: [AuthController],
  providers: [ AuthService, AuthRepo, JwtStrategy ],
})
export class AuthModule {}
