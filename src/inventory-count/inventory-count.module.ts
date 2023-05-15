import { Module } from '@nestjs/common';
import { InventoryCountService } from './inventory-count.service';
import { InventoryCountController } from './inventory-count.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Inventory,
  InventorySchema,
} from 'src/inventory/schemas/inventory.schema';
import {
  InventoryCount,
  InventoryCountSchema,
} from './schema/inventory-count.schema';
import { UnitOfMeasureModule } from 'src/unit-of-measure/unit-of-measure.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { InventoryCountHelperService } from './inventory-count-helper.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Inventory.name, schema: InventorySchema },
      { name: InventoryCount.name, schema: InventoryCountSchema },
    ]),
    UnitOfMeasureModule,
    InventoryModule,
  ],
  controllers: [InventoryCountController],
  providers: [InventoryCountService, InventoryCountHelperService],
})
export class InventoryCountModule {}
