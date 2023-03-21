import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';

import { catchError, lastValueFrom, map } from 'rxjs';

import { ConfigService } from '@nestjs/config';
import * as rp from 'request-promise';

@Injectable()
export class TaqnyatService {
  public config = {
    baseApiUrl: 'https://api.taqnyat.sa',
    brand: 'RAG',
  };
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async send(phoneNumber, message) {
    const data = {
      sender: this.configService.get('taqnyat.TAQNYAT_SENDER'),
      body: message,
      recipients: phoneNumber,
    };

    const options = {
      method: 'POST',
      uri: this.config.baseApiUrl + '/v1/messages',
      body: data,
      auth: {
        bearer: this.configService.get('taqnyat.TAQNYAT_TOKEN'),
      },
      json: true, // Automatically stringifies the body to JSON
    };

    const result = await rp(options).then(
      function (res) {
        return res;
      },
      function (err) {
        return err.error;
      },
    );
    console.log(result);

    return result;
  }
}
