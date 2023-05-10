import { Module, forwardRef } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Inventory, InventorySchema } from './schemas/inventory.schema';
import { InventoryHelperService } from './inventory-helper.service';
import { MenuItem, MenuItemSchema } from 'src/menu/schemas/menu-item.schema';
import { Material, MaterialSchema } from 'src/material/schemas/material.schema';
import { I18nModule } from 'nestjs-i18n';
import { UnitOfMeasureModule } from 'src/unit-of-measure/unit-of-measure.module';
import { InventoryHistory, InventoryHistorySchema } from './schemas/inventory-history.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Inventory.name, schema: InventorySchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: Material.name, schema: MaterialSchema },
      { name: InventoryHistory.name, schema: InventoryHistorySchema },
    ]),
    forwardRef(() => UnitOfMeasureModule),
  ],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryHelperService],
  exports: [InventoryHelperService, InventoryService],
})
export class InventoryModule {}
