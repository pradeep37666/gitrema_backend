import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from 'src/order/schemas/order.schema';
import {
  Reservation,
  ReservationSchema,
} from 'src/reservation/schemas/reservation.schema';
import {
  Transaction,
  TransactionSchema,
} from 'src/transaction/schemas/transactions.schema';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { GlobalConfigModule } from 'src/global-config/global-config.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    GlobalConfigModule,
  ],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
