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
import { OrderModule } from 'src/order/order.module';
import { PrinterModule } from 'src/printer/printer.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    StorageModule,
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    OrderModule,
    PrinterModule,
    HttpModule,
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService, FatooraService, InvoiceHelperService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
