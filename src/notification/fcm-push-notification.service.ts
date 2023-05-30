import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mapLimit } from 'async';

import * as firebase from 'firebase-admin';
import { BatchResponse } from 'firebase-admin/lib/messaging/messaging-api';
import { chunk } from 'lodash';
import * as shell from 'shelljs';

export interface ISendFirebaseMessages {
  token: string;
  title?: string;
  message: string;
}

@Injectable()
export class FcmPushNotificationService {
  constructor(private configService: ConfigService) {
    const firebaseCredentials = JSON.parse(
      this.configService.get('firebase.FIREBASE_CREDENTIAL_JSON'),
    );
    const firebaseApp = firebase.initializeApp({
      credential: firebase.credential.cert(firebaseCredentials),
      databaseURL: this.configService.get('firebase.FIREBASE_DATABASE_URL'),
    });
  }

  public async sendFirebaseMessages(
    firebaseMessages: ISendFirebaseMessages[],
    dryRun?: boolean,
  ): Promise<BatchResponse> {
    const batchedFirebaseMessages = chunk(firebaseMessages, 500);

    const batchResponses = await mapLimit<
      ISendFirebaseMessages[],
      BatchResponse
    >(
      batchedFirebaseMessages,
      3,
      async (
        groupedFirebaseMessages: ISendFirebaseMessages[],
      ): Promise<BatchResponse> => {
        try {
          const tokenMessages: firebase.messaging.TokenMessage[] =
            groupedFirebaseMessages.map(({ message, title, token }) => ({
              notification: { body: message, title },
              token,
              apns: {
                payload: {
                  aps: {
                    'content-available': 1,
                  },
                },
              },
            }));

          return await this.sendAll(tokenMessages, dryRun);
        } catch (error) {
          return {
            responses: groupedFirebaseMessages.map(() => ({
              success: false,
              error,
            })),
            successCount: 0,
            failureCount: groupedFirebaseMessages.length,
          };
        }
      },
    );

    return batchResponses.reduce(
      ({ responses, successCount, failureCount }, currentResponse) => {
        return {
          responses: responses.concat(currentResponse.responses),
          successCount: successCount + currentResponse.successCount,
          failureCount: failureCount + currentResponse.failureCount,
        };
      },
      {
        responses: [],
        successCount: 0,
        failureCount: 0,
      } as unknown as BatchResponse,
    );
  }

  public async sendAll(
    messages: firebase.messaging.TokenMessage[],
    dryRun?: boolean,
  ): Promise<BatchResponse> {
    if (process.env.NODE_ENV === 'local') {
      for (const { notification, token } of messages) {
        shell.exec(
          `echo '{ "aps": { "alert": ${JSON.stringify(
            notification,
          )}, "token": "${token}" } }' | xcrun simctl push booted com.company.appname -`,
        );
      }
    }
    return firebase.messaging().sendAll(messages, dryRun);
  }
}
