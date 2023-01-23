import { Module } from '@nestjs/common';
import { PaymentSetupService } from './payment-setup.service';
import { PaymentSetupController } from './payment-setup.controller';

@Module({
  controllers: [PaymentSetupController],
  providers: [PaymentSetupService]
})
export class PaymentSetupModule {}
