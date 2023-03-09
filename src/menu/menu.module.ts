import { Module } from '@nestjs/common';
import { MenuCategoryController } from './controller/menu-category.controller';
import { MenuAdditionController } from './controller/menu-addition.controller';
import { MenuAdditionService } from './service/menu-addition.service';
import { MenuCategoryService } from './service/menu-category.service';
import {
  MenuCategory,
  MenuCategorySchema,
} from './schemas/menu-category.schema';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MenuAddition,
  MenuAdditionSchema,
} from './schemas/menu-addition.schema';
import { MenuItemController } from './controller/menu-item.controller';
import { MenuItemService } from './service/menu-item.service';
import { MenuItem, MenuItemSchema } from './schemas/menu-item.schema';
import {
  Supplier,
  SupplierSchema,
} from 'src/supplier/schemas/suppliers.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: MenuCategory.name, schema: MenuCategorySchema },
      { name: MenuAddition.name, schema: MenuAdditionSchema },
      { name: Supplier.name, schema: SupplierSchema },
    ]),
  ],
  controllers: [
    MenuCategoryController,
    MenuAdditionController,
    MenuItemController,
  ],
  providers: [MenuAdditionService, MenuCategoryService, MenuItemService],
  exports: [MenuAdditionService, MenuCategoryService, MenuItemService],
})
export class MenuModule {}
