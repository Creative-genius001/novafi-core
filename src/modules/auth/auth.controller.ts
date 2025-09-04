/* eslint-disable prettier/prettier */
import { Body, Controller, Ip, Post, Req, HttpCode, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { LoginDto, RefreshTokenDto, ResendOtpDto, SignupDto, StartEmailChangeDto, StartPasswordChangeDto, VerifyEmailChangeDto, VerifyOtpDto, VerifyPasswordChangeDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';

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

  @HttpCode(200)
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

  @HttpCode(200)
  @Post('/verify-otp')
  async verifyOtp(@Body() payload: VerifyOtpDto){
    return this.authService.verifyOtp(payload)
  }

  @HttpCode(200)
  @Post('/resend-otp')
  async resendOtp(@Body()payload: ResendOtpDto){
    return this.authService.resendOtp(payload)
  }

  @HttpCode(200)
  @Post('/refresh')
  async refreshAccessToken(@Body() payload: RefreshTokenDto){
    return this.authService.refreshAccessToken(payload.refreshToken)
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  @Post('/email/initiate')
  startEmailChange(@Req() req, @Body() payload: StartEmailChangeDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;
    return this.authService.startEmailChange(userId, payload);
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  @Post('/email/verify')
  verifyEmailChange(@Req() req, @Body() payload: VerifyEmailChangeDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;
    return this.authService.verifyEmailChange(userId, payload.otp);
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  @Post('/password/initiate')
  startPasswordChange(@Req() req, @Body() payload: StartPasswordChangeDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;
    return this.authService.startPasswordChange(userId, payload.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  @Post('/password/verify')
  verifyPasswordChange(@Req() req, @Body() payload: VerifyPasswordChangeDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = req.user.userId as string;
    return this.authService.verifyPasswordChange(userId, payload);
  }
  
}
