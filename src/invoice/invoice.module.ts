import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { FatooraService } from './fatoora.service';
import { StorageModule } from 'src/core/Providers/Storage/storage.module';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';
import { MongooseModule } from '@nestjs/mongoose';

import { ReservationModule } from '../reservation/reservation.module';
import { Order, OrderSchema } from 'src/order/schemas/order.schema';
import { InvoiceHelperService } from './invoice-helper.service';

@Module({
  imports: [
    StorageModule,
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService, FatooraService, InvoiceHelperService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
