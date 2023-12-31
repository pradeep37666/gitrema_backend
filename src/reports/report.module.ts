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
import { SalesReportService } from './sales-report.service';
import {
  Supplier,
  SupplierSchema,
} from 'src/supplier/schemas/suppliers.schema';
import { PaymentReportService } from './payment-report.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Supplier.name, schema: SupplierSchema },
    ]),
    GlobalConfigModule,
  ],
  controllers: [ReportController],
  providers: [ReportService, SalesReportService, PaymentReportService],
  exports: [ReportService],
})
export class ReportModule {}
