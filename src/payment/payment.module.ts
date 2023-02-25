import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentGatewayModule } from 'src/core/Providers/PaymentsGateways/payment-gateway.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { OrderModule } from 'src/order/order.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Transaction,
  TransactionSchema,
} from 'src/transaction/schemas/transactions.schema';
import { Order, OrderSchema } from 'src/order/schemas/order.schema';
import { SocketIoModule } from 'src/socket-io/socket-io.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    PaymentGatewayModule,
    TransactionModule,
    OrderModule,
    SocketIoModule,
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
