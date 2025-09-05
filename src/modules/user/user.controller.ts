/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { createBeneficiaryDto, UpdateUserDto } from './dto/user.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {

    constructor(
        private readonly userService: UserService
    ){}

    @Get('profile')
    async getUser(@Req() req){
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const userId = req.user.userId as string;
        return this.userService.getUser(userId)
    }

    @Put('update')
    async updateUser(@Req() req, @Body() payload: UpdateUserDto){
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const userId = req.user.userId as string;
        return this.userService.updateUser(userId, payload)
    }

    @Post('/create-beneficiary')
    async createBeneficiary(@Req() req, payload: createBeneficiaryDto){
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const userId = req.user.userId as string;
        return this.userService.createBeneficiary(userId, payload)
    }
}
