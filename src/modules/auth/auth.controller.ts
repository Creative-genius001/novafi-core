/* eslint-disable prettier/prettier */
import { Body, Controller, Ip, Post, Query, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { LoginDto, RefreshTokenDto, SignupDto, VerifyOtpDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signup(
    @Body() payload: SignupDto,
    @Req() req: Request,
    @Ip() ip: string
  ){
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || ip;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userAgent: string = req.headers['user-agent'] || 'not-provided';
    return this.authService.signup(payload, userAgent, ipAddress)
  }

  @Post('/login')
  async login(
    @Body() payload: LoginDto,
    @Req() req: Request,
    @Ip() ip: string
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || ip;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userAgent: string = req.headers['user-agent'] || 'not-provided';
    return this.authService.login(payload, userAgent, ipAddress)
  }

  @Post('/verify-otp')
  async verifyOtp(@Body() payload: VerifyOtpDto){
    return this.authService.verifyOtp(payload)
  }

  @Post('/resend-otp')
  async resendOtp(@Query('userId') userId: string){
    return this.authService.resendOtp(userId)
  }

  @Post('/refresh')
  async refreshAccessToken(@Body() payload: RefreshTokenDto){
    return this.authService.refreshAccessToken(payload.refreshToken)
  }
}
