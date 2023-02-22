import { Module } from '@nestjs/common';
import { CashierService } from './cashier.service';
import { CashierController } from './cashier.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cashier, CashierSchema } from './schemas/cashier.schema';
import { CashierLog, CashierLogSchema } from './schemas/cashier-log.schema';
import { CashierLogService } from './cashier-log.service';
import { Transaction, TransactionSchema } from 'src/transaction/schemas/transactions.schema';
import { User, UserSchema } from 'src/users/schemas/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cashier.name, schema: CashierSchema },
      { name: CashierLog.name, schema: CashierLogSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: User.name, schema: UserSchema },

    ]),
  ],
  controllers: [CashierController],
  providers: [CashierService, CashierLogService],
  exports: [CashierLogService]
})
export class CashierModule {}
