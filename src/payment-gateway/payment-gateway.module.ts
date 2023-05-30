import { Module } from '@nestjs/common';
import { PaymentGatewayService } from './payment-gateway.service';
import { PaymentGatewayController } from './payment-gateway.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PaymentGateway,
  PaymentGatewaySchema,
} from './schema/payment-gateway.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentGateway.name, schema: PaymentGatewaySchema },
    ]),
  ],
  controllers: [PaymentGatewayController],
  providers: [PaymentGatewayService],
  exports: [PaymentGatewayService],
})
export class PaymentGatewayModule {}
