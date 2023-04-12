import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, lastValueFrom, map } from 'rxjs';

import { AddOrder } from './interface/add-order.interface';

@Injectable()
export class YallowService {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}
  async addOrder(payload: AddOrder): Promise<any> {
    const response = {
      status: false,
      request: payload,
      response: null,
      error: null,
    };
    try {
      const apiRes = await lastValueFrom(
        this.httpService
          .post(
            `${this.configService.get(
              'yallow.API_BASE_URL',
            )}/a/${this.configService.get('yallow.TOKEN')}/order/add`,
            payload,
            {
              headers: { 'Accept-Encoding': 'gzip,deflate,compress' },
            },
          )
          .pipe(map((resp) => resp.data))
          .pipe(
            catchError((e) => {
              //console.log(e);
              throw e;
            }),
          ),
      );
      response.status = true;
      response.response = apiRes;
    } catch (err) {
      response.error = err?.response?.data;
    }
    return response;
  }
}
