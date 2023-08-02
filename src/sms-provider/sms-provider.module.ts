import { Module } from '@nestjs/common';
import { SmsProviderService } from './sms-provider.service';
import { SmsProviderController } from './sms-provider.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SmsProvider, SmsProviderSchema } from './schema/sms-provider.schema';
import { SmsModule } from 'src/core/Providers/Sms/sms.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SmsProvider.name, schema: SmsProviderSchema },
    ]),
    SmsModule,
  ],
  controllers: [SmsProviderController],
  providers: [SmsProviderService],
})
export class SmsProviderModule {}
