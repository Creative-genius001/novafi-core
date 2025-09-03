/* eslint-disable prettier/prettier */

import { PrismaService } from "../prisma.service";
import { SignupDto } from "../../../modules/auth/dto/auth.dto";
import { KYCStatus, Prisma, User } from "@prisma/client"
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { AppLogger } from "../../../common/logger/logger.service";

@Injectable()
export class Repository {
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
        throw new BadRequestException(`Phone number already exists`);
      }
    }

    this.logger.error('CREATING_USER', error);
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
      this.logger.error('FIND_USER_BY_EMAIL', error )  
      throw error;
    }
  }

   async findById(userId: string): Promise<User | null> {
    try {
        return await this.prisma.user.findUnique({
            where: { id: userId },
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

  async updateRefreshToken(userId: string, hashed: string, expiresAt: string){
    return await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: hashed, expiresAt },
        });
  }

  async updateKycStatus(userId: string, kycStatus: KYCStatus){
    return await this.prisma.user.update({
            where: { id: userId },
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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


// const user = await this.prisma.$transaction(async (tx) => {
//         const newUser = await tx.user.create({
//           data: {
//             email,
//             password: hashedPassword,
//             phone,
//           },
//         });

//         await tx.wallet.create({
//           data: {
//             userId: newUser.id,
//             balance: 0,
//           },
//         });

//         return newUser;
//       });