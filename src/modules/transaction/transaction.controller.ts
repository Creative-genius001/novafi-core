/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateBillPaymentDto, GetBillInformationDto, RetrieveAccountNameDto } from './dto/transaction.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('transaction')
export class TransactionController {
    constructor(
        private readonly transactionService: TransactionService
    ){}

    @Get()
    async getAllTransactions(@Req() req){
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const userId = req.user.userId as string;
        return this.transactionService.getAllTransactions(userId)
    }

    @Get(':id')
    async getSingleTransaction(@Param('id') transactionId: string){
        return this.transactionService.getSingleTransaction(transactionId)
    }

    @Post('/deposit')
    async deposit(@Body() payload: any){
        
    }

    @Post('/transfer')
    async transfer(@Body() payload: any) {

    }

    @Post('/bill/payment')
    async billPayment(@Body() payload: CreateBillPaymentDto){
        return this.transactionService.createBillPayment(payload)
    }

    @Get('/bill/:category')
    async getBillerInformation(@Param() categoryCode: GetBillInformationDto){
        return this.transactionService.getBillerInformation(categoryCode.categoryCode)
    }

    @Get('/banks')
    async getBanks(){
        return this.transactionService.getBanks()
    }

    @Post('/banks/account/resolve')
    async retrieveAccountName(@Body() payload: RetrieveAccountNameDto){
        return this.transactionService.retrieveAccountName(payload)
    }
}
