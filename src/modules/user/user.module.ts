/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { LoggerModule } from 'src/common/logger/logger.module';
import { Repository } from 'src/infrastructure/prisma/repository/user.repository';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { JwtStrategy } from '../auth/strategy/jwt.strategy';

@Module({
  imports: [LoggerModule, PrismaModule],
  controllers: [UserController],
  providers: [UserService, Repository, JwtStrategy]
})
export class UserModule {}
