/* eslint-disable prettier/prettier */

import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { CreateUserDto } from "../../auth/dto/auth.dto";
import { Prisma, User, KycStatus } from "@prisma/client"
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { AppLogger } from "../../../common/logger/logger.service";
import {  createBeneficiaryDto, UpdateUserDto } from "src/modules/user/dto/user.dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { BvnRecord } from "src/modules/kyc/interface/kyc.interface";

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

  async retrivePassword(userId: string) {
    try {
        return await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
              password: true,
              email: true,
              lastEmailChangeAt: true,
              lastPasswordChangeAt: true,
            }
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
              isEmailVerified: true,
              isKycVerified: true,
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

  async updateEmail(userId: string, email: string){
    return await this.prisma.user.update({
      where: { id: userId },
      data: { 
        email,
        lastEmailChangeAt: new Date()
       },
      select: { id: true, email: true },
    });
  }

  async updatePassword(userId: string, password: string){
    return await this.prisma.user.update({
      where: { id: userId },
      data: { 
        password, 
        lastPasswordChangeAt: new Date()
      },
    });
  }


  async checkKycStatus(userId: string){
    return await this.prisma.user.findUnique({
            where: { id: userId },
            select: { isKycVerified: true },
        });
  }

  async updateKycStatus(userId: string, status: KycStatus) {
  try {
    
      return await this.prisma.user.update({
        where: { id: userId },
        data: { isKycVerified: status },
      });

  } catch (error) {
    this.logger.error('KYC_VERIFICATION', error);
    throw error;
  }
}

async updateEmailStatus(userId: string) {
  try {
    
      return await this.prisma.user.update({
        where: { id: userId },
        data: { isEmailVerified: 'VERIFIED' },
      });

  } catch (error) {
    this.logger.error('EMAIL_VERIFICATION', error);
    throw error;
  }
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

  async creatBeneficiary(userId: string, payload: createBeneficiaryDto){
    return await this.prisma.beneficiary.create({
      data: {
        userId,
        bankCode: payload.bankCode,
        bankName: payload.bankName,
        accountNumber: payload.accountNumber,
        beneficiaryName: payload.beneficiaryName
      }
    });
  }

  async createBvnRecord(userId: string, payload: BvnRecord) {
    return await this.prisma.bvnVerification.create({
      data: { 
        ...payload,
        userId,
       }
    });
  }
}
