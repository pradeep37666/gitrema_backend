import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mime from 'mime-types';
import * as path from 'path';

import { SendMailDto } from './mail.dto';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService, // private readonly customFieldService: CustomFieldsService,
  ) {}

  async send(sendMailDetails: SendMailDto): Promise<void> {
    const attachmentsArr = [];
    for (const i in sendMailDetails.attachments) {
      attachmentsArr.push({
        filename: path.basename(sendMailDetails.attachments[i].filename),
        contentDisposition: 'attachment',
        contentType: mime.lookup(sendMailDetails.attachments[i].filename),
        path: sendMailDetails.attachments[i].filename,
        href: sendMailDetails.attachments[i].filename,
      });
    }

    // const html = await this.customFieldService.resolveCustomFields(
    //   sendMailDetails.body,
    //   metaData,
    // );
    // const subject = await this.customFieldService.resolveCustomFields(
    //   sendMailDetails.subject,
    //   metaData,
    // );
    this.mailerService.sendMail({
      to: sendMailDetails.to,
      from: sendMailDetails.from
        ? sendMailDetails.from + ' ' + this.configService.get('mail.MAIL_FROM')
        : this.configService.get('mail.MAIL_FROM_NAME') +
          ' ' +
          this.configService.get('mail.MAIL_FROM'),
      replyTo: sendMailDetails.replyTo,
      cc: sendMailDetails.cc,
      subject: sendMailDetails.subject,
      template: './base',
      context: {
        body: sendMailDetails.body,
        subject: sendMailDetails.subject,
      },
      attachments: attachmentsArr,
    });
  }
}
