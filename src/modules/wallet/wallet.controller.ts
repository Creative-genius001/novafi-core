/* eslint-disable prettier/prettier */
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WalletService } from './wallet.service';

@UseGuards(AuthGuard('jwt'))
@Controller('wallet')
export class WalletController {
    constructor(
        private readonly walletService: WalletService
    ){}

    @Get()
    async getWallet(@Req() req){
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const userId = req.user.userId as string;
        return this.walletService.getWallet(userId)
    }

    @Get()
    async getBalance(@Req() req){
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const userId = req.user.userId as string;
        return this.walletService.getBalance(userId)
    }

}
