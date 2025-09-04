/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { LoggerModule } from 'src/common/logger/logger.module';
import { Repository } from 'src/infrastructure/prisma/repository/user.repository';

@Module({
  imports: [LoggerModule],
  controllers: [UserController],
  providers: [UserService, Repository]
})
export class UserModule {}
