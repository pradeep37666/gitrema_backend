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
import {
  InventoryHistory,
  InventoryHistorySchema,
} from './schemas/inventory-history.schema';
import { Recipe, RecipeSchema } from 'src/recipe/schema/recipe.schema';
import { RecipeModule } from 'src/recipe/recipe.module';
import {
  ProfitDetail,
  ProfitDetailSchema,
} from 'src/profit-detail/schema/profit-detail.schema';
import {
  RestaurantMaterial,
  RestaurantMaterialSchema,
} from 'src/material/schemas/restaurant-material.schema';
import { InventorySchedulerService } from './inventory-scheduler.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MailModule } from 'src/notification/mail/mail.module';
import { GlobalConfigModule } from 'src/global-config/global-config.module';
import {
  Restaurant,
  RestaurantSchema,
} from 'src/restaurant/schemas/restaurant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Inventory.name, schema: InventorySchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: Material.name, schema: MaterialSchema },
      { name: InventoryHistory.name, schema: InventoryHistorySchema },
      { name: Recipe.name, schema: RecipeSchema },
      { name: ProfitDetail.name, schema: ProfitDetailSchema },
      { name: RestaurantMaterial.name, schema: RestaurantMaterialSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
    ]),
    forwardRef(() => UnitOfMeasureModule),
    RecipeModule,
    MailModule,
    GlobalConfigModule,
  ],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    InventoryHelperService,
    InventorySchedulerService,
  ],
  exports: [InventoryHelperService, InventoryService],
})
export class InventoryModule {}
