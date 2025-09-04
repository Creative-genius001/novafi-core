/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Repository } from 'src/infrastructure/prisma/repository/user.repository';
import { UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
    constructor(
        private readonly repo: Repository,
    ){}

    async getUser(userId: string){
        const user =  await this.repo.findById(userId)

        return user;
    }

    async updateUser(userId: string, payload: UpdateUserDto){
        const updatedUser =  await this.repo.updateUser(userId, payload)

        return updatedUser;
    }
}
