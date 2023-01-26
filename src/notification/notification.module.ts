import { Module } from '@nestjs/common';

import { EmailTemplateModule } from './email-templates/email-template.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [MailModule, EmailTemplateModule],
  providers: [],
  controllers: [],
})
export class NotificationModule {}
