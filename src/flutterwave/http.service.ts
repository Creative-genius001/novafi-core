/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import * as config from '../config/config'
import { AppLogger } from 'src/common/logger/logger.service';
import { generateIdempotencyKey } from 'src/utils/utils';

@Injectable()
export class FlutterwaveHttpService {

  constructor(
    private readonly httpService: HttpService,
    private readonly logger: AppLogger
    ) {

   this.httpService.axiosRef.interceptors.request.use((axiosConfig: InternalAxiosRequestConfig) => {
      const token = config.config.FLUTTERWAVE_SECRET_KEY;
      const idempotencyKey = generateIdempotencyKey();
      const tracerId = generateIdempotencyKey();
      if (token) {
        axiosConfig.headers = axiosConfig.headers || {};
        (axiosConfig.headers as any).set('Authorization', `Bearer ${token}`);
        (axiosConfig.headers as any).set('Content-Type', 'application/json');
        (axiosConfig.headers as any).set('X-Idempotency-Key', idempotencyKey);
        (axiosConfig.headers as any).set('X-Trace-Id', tracerId);
      }
      return axiosConfig;
    });

  }

  async get<T>(url: string, axiosConfig?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.get<T>(url, axiosConfig),
      );
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'GET', url);
    }
  }

  async post<T>(
    url: string,
    data?: any,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.post<T>(url, data, axiosConfig),
      );
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'POST', url);
    }
  }

  async patch<T>(
    url: string,
    data?: any,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.patch<T>(url, data, axiosConfig),
      );
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'PATCH', url);
    }
  }

  async delete<T>(url: string, axiosConfig?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.delete<T>(url, axiosConfig),
      );
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'DELETE', url);
    }
  }

   private handleError(error: unknown, method: string, url: string): never {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    const flutterwaveError = axiosError.response?.data;

    this.logger.error(`${method} request failed`, {
      url,
      status,
      idempotencyKey: axiosError.config?.headers.get('X-Idempotency-Key'),
      tracerId: axiosError.config?.headers.get('X-Trace-Id'),
      error: flutterwaveError
    });

    if (status === 400) {
      throw new BadRequestException('An error occured');
    } else if (status === 401) {
      throw new UnauthorizedException('Invalid Flutterwave credentials');
    } else if (status === 429) {
      throw new BadRequestException('Rate limit exceeded, please try again later');
    } else if (status && status >= 500) {
      throw new InternalServerErrorException('Flutterwave service unavailable');
    } else if (axiosError.code === 'ECONNABORTED') {
      throw new InternalServerErrorException('Request to Flutterwave timed out');
    } else {
      throw new InternalServerErrorException('Failed to process request');
    }
  }
}
