import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';

import { EmailTemplateService } from './email-template.service';
import { EmailTemplateController } from './email-template.controller';
import {
  EmailTemplate,
  EmailTemplateSchema,
} from './schemas/email-template.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailTemplate.name, schema: EmailTemplateSchema },
    ]),
  ],
  providers: [EmailTemplateService],
  controllers: [EmailTemplateController],
})
export class EmailTemplateModule {}
