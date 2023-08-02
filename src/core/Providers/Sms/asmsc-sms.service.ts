import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';

import { catchError, lastValueFrom, map } from 'rxjs';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class AsmscService {
  public config = {
    baseApiUrl: 'https://rest.gateway.sa',
    brand: 'RAG',
  };
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  // async send(options: SmsDto) {
  //   const data = {
  //     api_id: this.configService.get('asmsc.API_ID'),
  //     api_password: this.configService.get('asmsc.API_PASSWORD'),
  //     encoding: 'T',
  //     sms_type: 'T',
  //     sender_id: this.configService.get('asmsc.SENDER_ID'),
  //     phonenumber: options.phoneNumber,
  //     textmessage: options.message,
  //   };
  //   console.log(data);
  //   const response = await lastValueFrom(
  //     this.httpService
  //       .post(this.config.baseApiUrl + '/api/SendSMSMulti/', data)
  //       .pipe(map((resp) => resp.data))
  //       .pipe(
  //         catchError((e) => {
  //           throw new BadRequestException(e);
  //         }),
  //       ),
  //   );
  //   console.log(response, typeof response);
  //   return response;
  // }
  async sendOtp(phoneNumber: string) {
    const data = {
      api_id: this.configService.get('asmsc.GATEWAY_SMS_API_ID'),
      api_password: this.configService.get('asmsc.GATEWAY_SMS_API_PASSWORD'),
      brand: this.configService.get('asmsc.GATEWAY_SMS_BRAND'),
      sender_id: this.configService.get('asmsc.GATEWAY_SMS_SENDER_ID'),
      phonenumber: phoneNumber,
    };
    console.log(data);
    const response = await lastValueFrom(
      this.httpService
        .post(this.config.baseApiUrl + '/api/Verify', data)
        .pipe(map((resp) => resp.data))
        .pipe(
          catchError((e) => {
            throw new BadRequestException(e);
          }),
        ),
    );
    console.log(response);
    return response;
  }

  async sendPromotionalMessage(
    phoneNumber: string,
    message: string,
    credentials = null,
  ) {
    if (!credentials) {
      credentials = {
        apiId: this.configService.get('asmsc.GATEWAY_SMS_API_ID'),
        apiPassword: this.configService.get('asmsc.GATEWAY_SMS_API_PASSWORD'),
        brand: this.configService.get('asmsc.GATEWAY_SMS_BRAND'),
        senderId: this.configService.get('asmsc.GATEWAY_SMS_SENDER_ID'),
      };
    }
    const data = {
      api_id: credentials.apiId,
      api_password: credentials.apiPassword,
      brand: credentials.brand,
      sender_id: credentials.senderId,
      phonenumber: phoneNumber,
      textmessage: message,
      sms_type: 'P',
    };
    console.log(data);
    const response = await lastValueFrom(
      this.httpService
        .post(this.config.baseApiUrl + '/api/SendSMS', data)
        .pipe(map((resp) => resp.data))
        .pipe(
          catchError((e) => {
            throw new BadRequestException(e);
          }),
        ),
    );
    console.log(response);
    return response;
  }

  async verifyOtp(options) {
    const data = {
      api_id: this.configService.get('asmsc.GATEWAY_SMS_API_ID'),
      api_password: this.configService.get('asmsc.GATEWAY_SMS_API_PASSWORD'),
      verfication_id: options.verificationId?.toString(),
      verfication_code: options.verificationCode?.toString(),
    };
    console.log(data);

    const response = await lastValueFrom(
      this.httpService
        .post(this.config.baseApiUrl + '/api/VerifyStatus', data)
        .pipe(map((resp) => resp.data))
        .pipe(
          catchError((e) => {
            throw new BadRequestException(e);
          }),
        ),
    );

    return response;
  }
}
