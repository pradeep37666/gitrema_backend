import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
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

@Injectable()
export class ArbPgService {
  public config = {
    baseApiUrl: this.configService.get('arbPg.ARB_PG_API_URL'),
    iv: 'PGKEYENCDECIVSPC',
    currencyCode: 682,
    name: 'ARB PG',
    successUrl:
      this.configService.get('app.baseUrl') +
      '/arb-pg-webhook/process-payment-response',
    errorUrl:
      this.configService.get('app.baseUrl') +
      '/arb-pg-webhook/process-payment-response',
    frontendSuccessUrl:
      this.configService.get('app.frontendBaseUrl') + '/success',
    frontendErrorUrl:
      this.configService.get('app.frontendBaseUrl') + '/decline',
    variableFeeMada: 1.5,
    variableFee: 2,
    fixedFee: 1,
    taxOnFee: 15,
  };
  private credentials = {
    transportalId: this.configService.get('arbPg.ARB_PG_TRANSPORTAL_ID'),
    apiUrl: this.configService.get('arbPg.ARB_PG_API_URL'),
    resourceKey: this.configService.get('arbPg.ARB_PG_RESOURCE_KEY'),
    transportalPassword: this.configService.get(
      'arbPg.ARB_PG_TRANSPORTAL_PASSWORD',
    ),
  };
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async init(paymentGateway: PaymentGatewayDocument) {
    if (paymentGateway) {
      this.credentials = paymentGateway.credentials;
      this.config.baseApiUrl = this.credentials.apiUrl;
    }
  }
  async requestPaymentToken(options: PaymentTokenDto) {
    const data = [
      {
        id: this.credentials.transportalId,
        trandata: this.aesEncrypt(
          JSON.stringify([
            {
              amt: options.amount.toFixed(2),
              action: options.action,
              id: this.credentials.transportalId,
              password: this.credentials.transportalPassword,
              currencyCode: this.config.currencyCode,
              trackId: options.transactionId,
              udf1: options.orderId,
              udf2: options.metaId,
              udf3: options.redirectUrl
                ? Buffer.from(options.redirectUrl).toString('base64')
                : '',
              responseURL: this.config.successUrl,
              errorURL: this.config.errorUrl,
            },
          ]),
        ),
        responseURL: this.config.successUrl,
        errorURL: this.config.errorUrl,
      },
    ];

    const response = await lastValueFrom(
      this.httpService
        .post(this.config.baseApiUrl, data)
        .pipe(map((resp) => resp.data))
        .pipe(
          catchError((e) => {
            throw new BadRequestException(e);
          }),
        ),
    );
    console.log(response, typeof response);
    if (typeof response == 'object' && response.length > 0) {
      if (response[0].status == '1') {
        const paymentRes = response[0].result.split(':');
        console.log(paymentRes);
        if (paymentRes.length == 3) {
          const paymentId = paymentRes.shift();
          const res = {
            paymentId,
            url: paymentRes.join(':'),
            finalUrl: paymentRes.join(':') + '?PaymentID=' + paymentId,
          };

          return res;
        }
      }
    }
    throw new BadRequestException(VALIDATION_MESSAGES.PaymentError.key);
  }

  aesEncrypt(trandata): any {
    const rkEncryptionIv = aesjs.utils.utf8.toBytes(this.config.iv);
    const enckey = aesjs.utils.utf8.toBytes(this.credentials.resourceKey);
    const aesCtr = new aesjs.ModeOfOperation.cbc(enckey, rkEncryptionIv);
    const textBytes = aesjs.utils.utf8.toBytes(trandata);
    const encryptedBytes = aesCtr.encrypt(aesjs.padding.pkcs7.pad(textBytes));
    const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    return encryptedHex;
  }

  aesDecryption(encryptedHex) {
    const enckey = aesjs.utils.utf8.toBytes(this.credentials.resourceKey);
    const rkEncryptionIv = aesjs.utils.utf8.toBytes(this.config.iv);
    const encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
    const aesCbc = new aesjs.ModeOfOperation.cbc(enckey, rkEncryptionIv);
    const decryptedBytes = aesCbc.decrypt(encryptedBytes);
    const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    return decryptedText;
  }

  parseTransResponse(transData: string) {
    transData = decodeURIComponent(transData);
    transData = transData
      .replace(/\\n/g, '\\n')
      .replace(/\\'/g, "\\'")
      .replace(/\\"/g, '\\"')
      .replace(/\\&/g, '\\&')
      .replace(/\\r/g, '\\r')
      .replace(/\\t/g, '\\t')
      .replace(/\\b/g, '\\b')
      .replace(/\\f/g, '\\f');
    // Remove non-printable and other non-valid JSON characters
    transData = transData.replace(/[\u0000-\u0019]+/g, '');
    const transObj = JSON.parse(transData);
    return transObj[0];
  }
}
export class PaymentTokenDto {
  orderId?: string;

  amount: number;

  action: number;

  transactionId: string;

  currencyCode?: number;

  metaId?: string;

  redirectUrl?: string;

  accountDetails: any[];
}
