import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { join } from 'path';

import { MailController } from './mail.controller';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('mail.MAIL_HOST'),
          port: config.get('mail.MAIL_PORT'),
          secure: config.get('mail.MAIL_SECURE'),
          auth: {
            user: config.get('mail.MAIL_USER'),
            pass: config.get('mail.MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: config.get('mail.MAIL_FROM'),
        },
        template: {
          dir: join('src/notification/mail/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
  controllers: [MailController],
})
export class MailModule {}
