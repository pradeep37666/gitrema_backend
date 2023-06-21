import { Module, forwardRef } from '@nestjs/common';
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
import { Cashier, CashierSchema } from 'src/cashier/schemas/cashier.schema';
import { CashierModule } from 'src/cashier/cashier.module';
import { PaymentSetupModule } from 'src/payment-setup/payment-setup.module';
import { SupplierModule } from 'src/supplier/Supplier.module';
import { GlobalConfigModule } from 'src/global-config/global-config.module';
import { PaymentGatewayModule as PGConfigModule } from 'src/payment-gateway/payment-gateway.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Cashier.name, schema: CashierSchema },
    ]),
    PaymentGatewayModule,
    TransactionModule,
    OrderModule,
    SocketIoModule,
    CashierModule,
    PaymentSetupModule,
    forwardRef(() => SupplierModule),
    GlobalConfigModule,
    PGConfigModule,
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
