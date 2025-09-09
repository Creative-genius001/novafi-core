/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BankService } from './bank.service';
import { RetrieveAccountNameDto } from './dto/bank.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('banks')
export class BankController {
    constructor(
        private readonly bankService: BankService
    ){}

    @Get()
    async getBanks(){
        return this.bankService.getBanks()
    }

    @Post('/account/resolve')
    async retrieveAccountName(@Body() payload: RetrieveAccountNameDto){
        return this.bankService.retrieveAccountName(payload)
    }
}
