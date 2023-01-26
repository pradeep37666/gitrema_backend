import { Module } from '@nestjs/common';
import { CashierService } from './cashier.service';
import { CashierController } from './cashier.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cashier, CashierSchema } from './schemas/cashier.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cashier.name, schema: CashierSchema }]),
  ],
  controllers: [CashierController],
  providers: [CashierService],
})
export class CashierModule {}
