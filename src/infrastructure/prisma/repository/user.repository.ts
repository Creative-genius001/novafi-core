/* eslint-disable prettier/prettier */

import { PrismaService } from "../prisma.service";
import { CreateUserDto } from "../../../modules/auth/dto/auth.dto";
import { KYCStatus, Prisma, User } from "@prisma/client"
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { AppLogger } from "../../../common/logger/logger.service";
import { UpdateUserDto } from "src/modules/user/dto/user.dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class Repository {
  constructor(
    private readonly logger: AppLogger,
    private readonly prisma: PrismaService,
    
    ) {}

  async createUser(payload: CreateUserDto): Promise<User> {
  const { firstname, lastname, password, phone, email, novaId, referralCode, referredBy } = payload;
  
  try {
    const result = await this.prisma.$transaction(async (tx) => {
    const user =  await tx.user.create({
      data: {
          firstname,
          lastname,
          email,
          password,
          phone,
          novaId,
          referralCode,
          referredBy
        },
      });

      await tx.wallet.create({
          data: {
            userId: user.id,
          },
      });
      

      return user;

    })

    return result;
    
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new BadRequestException(`Phone number already exists`);
      }
    }

    this.logger.error('CREATING_USER', error);
    throw new InternalServerErrorException('Something went wrong while creating user');
  }
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
      this.logger.error('FIND_USER_BY_EMAIL', error )  
      throw error;
    }
  }

   async findById(userId: string) {
    try {
        return await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              phone: true,
              novaId: true,
              isVerified: true,
              kycLevel: true,
              kycStatus: true,
              twoFaEnabled: true,
              twoFaSecret: true,
              referralCode: true,
              referredBy: true
            }
        });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
       if(error.code === 'P2025'){
          throw new NotFoundException('User does not exist');
        }
      }
      this.logger.error('FIND_USER_BY_ID', error )  
      throw error;
    }
  }

  async checkNovaIdExist(novaId: string){
    return await this.prisma.user.findUnique({
      where: { novaId },
      select: {novaId: true}
    })
  }

  async updateRefreshToken(userId: string, hashed: string, expiresAt: string){
    return await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: hashed, expiresAt },
        });
  }

  async updateKycStatus(userId: string, kycStatus: KYCStatus){
    return await this.prisma.user.update({
            where: { id: userId },
            data: { kycStatus },
        });
  }

  async getKycStatus(userId: string){
    return await this.prisma.user.findUnique({
            where: { id: userId },
            select: { kycStatus: true },
        });
  }

  async updateIsVerified(userId: string){
    return await this.prisma.user.update({
            where: { id: userId },
            data: { isVerified: true, kycStatus: 'SUCCESSFUL' },
        });
  }

  async updateUser(userId: string, dto: UpdateUserDto) {

    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(dto.firstname !== undefined && { firstname: dto.firstname }),
          ...(dto.lastname !== undefined && { lastname: dto.lastname }),
        },
        select: { firstname: true, lastname: true }
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundException("User not found");
        }
      }
      throw error;
    }
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

        this.logger.error('RETRIEVE_REFRESH_TOKEN', error )
        throw error;
    }
  }
}
