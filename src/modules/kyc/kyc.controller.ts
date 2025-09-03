/* eslint-disable prettier/prettier */

import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { KycService } from './kyc.service';
import { InitiateKycDto } from './dto/kyc.dto';
import { AuthGuard } from '@nestjs/passport';
@UseGuards(AuthGuard('jwt'))
@Controller('kyc')
export class KycController {
  constructor(
    private readonly kycService: KycService,
  ) {}

  @Post('initiate')  
  async getKycAccessToken(@Req() req, @Body() payload: InitiateKycDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;
    return this.kycService.initiateKyc(userId, payload);
  }

  @Get('status')
  async getKycStatus(@Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;
    return await this.kycService.getKycStatus(userId);
  }

  // @Post('webhook')
  // async handleWebhook(@Body() data: any) {
  //   // this.logger.debug('Received KYC webhook', { applicantId: data.applicantId });
  //   await this.kycService.handleKycWebhook();
  //   return { status: 'OK' };
  // }
}
