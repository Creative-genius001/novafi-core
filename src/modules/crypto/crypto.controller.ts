/* eslint-disable prettier/prettier */
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CryptoService } from './crypto.service';
import { GenerateAddressQueryDto } from './dto/crypto.dto';
import { AppLogger } from 'src/common/logger/logger.service';

@UseGuards(AuthGuard('jwt'))
@Controller('crypto')
export class CryptoController {

    constructor(
        private readonly logger: AppLogger,
        private readonly cryptoService: CryptoService
    ){}

    @Get('/deposit/address')
    async getDepositAddress(@Req() req, @Query() query: GenerateAddressQueryDto){
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const userId = req.user.userId as string;
        return this.cryptoService.getDepositAddress(userId, query.cryptoType, query.network)
    }
    
}
