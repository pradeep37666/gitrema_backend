import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, lastValueFrom, map } from 'rxjs';

@Injectable()
export class WhatsappService {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async sendMessage(
    sessionId: string,
    phoneNumber: string,
    message: string,
  ): Promise<boolean> {
    const response = await lastValueFrom(
      this.httpService
        .post(
          `${this.configService.get(
            'app.whatsappBaseUrl',
          )}/whatsapp-manager/send-message`,
          {
            sessionId,
            phoneNumber,
            message,
          },
        )
        .pipe(map((resp) => resp.data))
        .pipe(
          catchError((e) => {
            throw new BadRequestException(e);
          }),
        ),
    );
    if (response && response.data == true) return true;
    return false;
  }
}
