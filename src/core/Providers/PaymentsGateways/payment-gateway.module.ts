import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';

import { ArbPgController } from './arb-pg.controller';
import { ArbPgService } from './arb-pg.service';
import { TransactionModule } from 'src/transaction/transaction.module';
import { SupplierModule } from 'src/supplier/Supplier.module';

@Module({
  imports: [HttpModule, TransactionModule, forwardRef(() => SupplierModule)],
  providers: [ArbPgService],
  controllers: [ArbPgController],
  exports: [ArbPgService],
})
export class PaymentGatewayModule {}
