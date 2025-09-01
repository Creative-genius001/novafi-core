/* eslint-disable prettier/prettier */
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { LoginDto, SignupDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signup(@Body() payload: SignupDto) {
    return this.authService.signup(payload)
  }

  @Post('/login')
  async login(@Body() payload: LoginDto) {
    return this.authService.login(payload)
  }
}
