import { Module } from '@nestjs/common';
import { CashierService } from './cashier.service';
import { CashierController } from './cashier.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cashier, CashierSchema } from './schemas/cashier.schema';
import { CashierLog, CashierLogSchema } from './schemas/cashier-log.schema';
import { CashierLogService } from './cashier-log.service';
import { CashierHelperService } from './cashier-helper.service';
import { SocketIoModule } from 'src/socket-io/socket-io.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cashier.name, schema: CashierSchema },
      { name: CashierLog.name, schema: CashierLogSchema },
    ]),
    SocketIoModule,
  ],
  controllers: [CashierController],
  providers: [CashierService, CashierLogService, CashierHelperService],
  exports: [CashierService, CashierLogService, CashierHelperService],
})
export class CashierModule {}
