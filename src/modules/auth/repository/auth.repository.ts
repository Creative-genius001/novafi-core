/* eslint-disable prettier/prettier */

import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { SignupDto } from "../dto/auth.dto";
import { Prisma, User } from "@prisma/client"
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { AppLogger } from "../../../common/logger/logger.service";

@Injectable()
export class AuthRepository {
  constructor(
    private readonly logger: AppLogger,
    private readonly prisma: PrismaService,
    
    ) {}

  async createUser(payload: SignupDto): Promise<User> {
  const { firstname, lastname, password, phone, email } = payload;
  let user: User;

  try {
    user = await this.prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        password,
        phone,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new BadRequestException(`User already exists`);
      }
    }

    this.logger.error('Error creating user', error);
    throw new InternalServerErrorException('Something went wrong while creating user');
  }

  return user;
}
  async checkEmailExist(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
        return await this.prisma.user.findUnique({
            where: { email },
        });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
       if(error.code === 'P2025'){
          throw new NotFoundException('User does not exist');
        }
      }
      this.logger.error('Error finding user by email', error )  
      throw error;
    }
  }

  async updateRefreshToken(userId: string, hashed: string, expiresAt: string){
    return await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: hashed, expiresAt },
        });
  }

  async updateIsVerified(userId: string){
    return await this.prisma.user.update({
            where: { id: userId },
            data: { isVerified: true },
        });
  }

  async getRefreshToken(userId: string){
    try {
        return await this.prisma.user.findFirst({
            where: {id: userId},
            select: { refreshToken: true, expiresAt: true }
        })
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if(error.code === 'P2025'){
            throw new UnauthorizedException('Invalid refresh token');
        }

        this.logger.error('Error retrieving refresh token from database', error )
        throw error;
    }
  }
}
