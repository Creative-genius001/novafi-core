/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';

const nigerianPhoneRegex = /^(\+234|0)?[789]\d{9}$/;

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/;

export class SignupDto {
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Password cannot be empty' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(30, { message: 'Password must not exceed 30 characters' })
  @Matches(strongPasswordRegex, { 
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.' 
  })
  password: string;

  @IsNotEmpty({ message: 'Phone number cannot be empty' })
  @IsString({ message: 'Phone number must be a string' })
  @Matches(nigerianPhoneRegex, { 
    message: 'Phone number is not valid'
  })
  phone: string;

  @IsNotEmpty({ message: 'First name cannot be empty' })
  @IsString({ message: 'First name must be a string' })
  firstname: string;

  @IsNotEmpty({ message: 'Last name cannot be empty' })
  @IsString({ message: 'Last name must be a string' })
  lastname: string;
}

export class LoginDto {
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsString()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Password cannot be empty' })
  @IsString()
  password: string;
}

export class VerifyOtpDto {
  @IsNotEmpty({ message: 'User ID cannot be empty' })
  @IsString()
  userId: string;

  @IsNotEmpty({ message: 'OTP cannot be empty' })
  @IsString()
  otp: string;
}

export class ResendOtpDto {
  @IsNotEmpty({ message: 'User ID cannot be empty' })
  @IsString()
  userId: string;

  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsString()
  @IsEmail()
  email: string;
}

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'Refresh token cannot be empty' })
  @IsString()
  refreshToken: string;
}

export class CreateUserDto extends SignupDto {
  @IsString()
  novaId: string;
}
