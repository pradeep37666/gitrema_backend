import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { chunk } from 'lodash';
import * as shell from 'shelljs';
import { Expo } from 'expo-server-sdk';

export interface ISendExpoMessages {
  to: string;
  sound: string;
  body: string;
  data: any;
}

@Injectable()
export class ExpoPushNotificationService {
  private expo = null;
  constructor(private configService: ConfigService) {
    this.expo = new Expo({
      accessToken: this.configService.get('pushNotification.EXPO_ACCESS_TOKEN'),
    });
  }
  public async sendPushMessages(messages: ISendExpoMessages[]): Promise<any> {
    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets = [];
    for (let chunk of chunks) {
      try {
        let ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }
  }
}
