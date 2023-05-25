import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';

import { ArbPgController } from './arb-pg.controller';
import { ArbPgService } from './arb-pg.service';
import { TransactionModule } from 'src/transaction/transaction.module';
import { SupplierModule } from 'src/supplier/Supplier.module';
import { NearPayController } from './near-pay.controller';
import { NearPayService } from './near-pay.service';
import { SocketIoModule } from 'src/socket-io/socket-io.module';

@Module({
  imports: [
    HttpModule,
    TransactionModule,
    forwardRef(() => SupplierModule),
    SocketIoModule,
  ],
  providers: [ArbPgService, NearPayService],
  controllers: [ArbPgController, NearPayController],
  exports: [ArbPgService],
})
export class PaymentGatewayModule {}
