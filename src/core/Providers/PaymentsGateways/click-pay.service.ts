import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Options,
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { catchError, lastValueFrom, map } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

import aesjs = require('aes-js');
import { ConfigService } from '@nestjs/config';
import { STATUS_MSG } from 'src/core/Constants/status-message.constants';
import { decodeBase64, encodeBase64 } from 'bcryptjs';
import { VALIDATION_MESSAGES } from 'src/core/Constants/validation-message';
import { PaymentGatewayService } from 'src/payment-gateway/payment-gateway.service';
import { PaymentGatewayDocument } from 'src/payment-gateway/schema/payment-gateway.schema';
import { ClickPayRequestDto } from './dto/clickpay-request.dto';

@Injectable()
export class ClickPayService {
  private credentials: any = {
    profileId: this.configService.get('clickpay.CLICKPAY_PROFILE_ID'),
    serverKey: this.configService.get('clickpay.CLICKPAY_SERVER_KEY'),
    apiUrl: this.configService.get('clickpay.CLICKPAY_API_URL'),
  };
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async init(paymentGateway: PaymentGatewayDocument) {
    if (paymentGateway) {
      this.credentials = paymentGateway.credentials;
    }
  }
  async requestPaymentToken(options: ClickPayRequestDto) {
    const response = await lastValueFrom(
      this.httpService
        .post(
          `${this.credentials.apiUrl}/payment/request`,
          {
            profile_id: this.credentials.profileId,
            tran_type: 'sale',
            tran_class: 'ecom',
            cart_id: options.transactionId,
            cart_currency: 'SAR',
            cart_description: options.transactionId,
            cart_amount: options.amount,
            callback:
              this.configService.get('app.baseUrl') +
              '/clickpay-webhook/process-payment-response',
            return: options.redirect,
          },
          {
            headers: {
              authorization: this.credentials.serverKey,
            },
          },
        )
        .pipe(map((resp) => resp.data))
        .pipe(
          catchError((e) => {
            console.log(e);
            throw new BadRequestException(e);
          }),
        ),
    );
    console.log(response);

    if (response) {
      return {
        paymentId: response.tran_ref,
        finalUrl: response.redirect_url,
      };
    }
    throw new BadRequestException(VALIDATION_MESSAGES.PaymentError.key);
  }
}
