import { Module } from '@nestjs/common';
import { ProductionEventService } from './production-event.service';
import { ProductionEventController } from './production-event.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductionEvent,
  ProductionEventSchema,
} from './schema/production-event.schema';
import { ProductionEventHelperService } from './production-event-helper.service';
import { InventoryModule } from 'src/inventory/inventory.module';
import { Recipe, RecipeSchema } from 'src/recipe/schema/recipe.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductionEvent.name, schema: ProductionEventSchema },
      { name: Recipe.name, schema: RecipeSchema },
    ]),
    InventoryModule,
  ],
  controllers: [ProductionEventController],
  providers: [ProductionEventService, ProductionEventHelperService],
})
export class ProductionEventModule {}
