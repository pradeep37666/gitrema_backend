import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SupplierController } from './Supplier.controller';
import { SupplierService } from './Supplier.service';
import { Supplier, SupplierSchema } from './schemas/suppliers.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Supplier.name, schema: SupplierSchema },
    ]),
  ],
  controllers: [SupplierController],
  providers: [SupplierService],
  exports: [SupplierService],
})
export class SupplierModule {}
