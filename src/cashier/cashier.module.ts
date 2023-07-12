import { Module } from '@nestjs/common';
import { CashierService } from './cashier.service';
import { CashierController } from './cashier.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cashier, CashierSchema } from './schemas/cashier.schema';
import { CashierLog, CashierLogSchema } from './schemas/cashier-log.schema';
import { CashierLogService } from './cashier-log.service';
import { CashierHelperService } from './cashier-helper.service';
import { SocketIoModule } from 'src/socket-io/socket-io.module';
import { User, UserSchema } from 'src/users/schemas/users.schema';
import {
  DeferredTransaction,
  DeferredTransactionSchema,
} from 'src/order/schemas/deferred-transaction.schema';
import {
  Supplier,
  SupplierSchema,
} from 'src/supplier/schemas/suppliers.schema';
import { Invoice, InvoiceSchema } from 'src/invoice/schemas/invoice.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cashier.name, schema: CashierSchema },
      { name: CashierLog.name, schema: CashierLogSchema },
      { name: User.name, schema: UserSchema },
      { name: DeferredTransaction.name, schema: DeferredTransactionSchema },
      { name: Supplier.name, schema: SupplierSchema },
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
    SocketIoModule,
  ],
  controllers: [CashierController],
  providers: [CashierService, CashierLogService, CashierHelperService],
  exports: [CashierService, CashierLogService, CashierHelperService],
})
export class CashierModule {}
