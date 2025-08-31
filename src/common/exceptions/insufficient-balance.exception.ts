/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus } from '@nestjs/common';

export class InsufficientBalanceException extends HttpException {
  constructor() {
    super('Insufficient balance in wallet', HttpStatus.BAD_REQUEST);
  }
}