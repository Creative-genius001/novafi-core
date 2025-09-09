/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { CreateBillPaymentDto, GetBillInformationDto } from './dto/transfer.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('transfer')
export class TransferController {
    constructor(
        private readonly transferService: TransferService
    ){}

    @Post('/deposit')
    async deposit(@Body() payload: any){
        
    }

    @Post('/transfer')
    async transfer(@Body() payload: any) {

    }

    @Post('/bill/payment')
    async billPayment(@Body() payload: CreateBillPaymentDto){
        return this.transferService.createBillPayment(payload)
    }

    @Get('/bill/:category')
    async getBillerInformation(@Param() categoryCode: GetBillInformationDto){
        return this.transferService.getBillerInformation(categoryCode.categoryCode)
    }
}
