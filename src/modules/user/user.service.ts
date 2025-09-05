/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Repository } from 'src/modules/user/repo/user.repository';
import { createBeneficiaryDto, UpdateUserDto } from './dto/user.dto';

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

    async createBeneficiary(userId: string, payload: createBeneficiaryDto){
        return await this.repo.creatBeneficiary(userId, payload) 
    }
}
