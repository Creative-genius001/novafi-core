/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '@nestjs/passport';

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

    
    @Get('/:id')
    async getSingleTransaction(@Param('id') transactionId: string){
        return this.transactionService.getSingleTransaction(transactionId)
    } 

}
