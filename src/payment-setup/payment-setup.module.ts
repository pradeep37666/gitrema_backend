import { Module } from '@nestjs/common';
import { PaymentSetupService } from './payment-setup.service';
import { PaymentSetupController } from './payment-setup.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PaymentSetup,
  PaymentSetupSchema,
} from './schemas/payment-setup.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentSetup.name, schema: PaymentSetupSchema },
    ]),
  ],
  controllers: [PaymentSetupController],
  providers: [PaymentSetupService],
})
export class PaymentSetupModule {}
