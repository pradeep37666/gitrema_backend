import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { Transaction, TransactionSchema } from './schemas/transactions.schema';
import { Order, OrderSchema } from 'src/order/schemas/order.schema';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    OrderModule,
  ],
  providers: [TransactionService],
  exports: [TransactionService],
  controllers: [TransactionController],
})
export class TransactionModule {}
