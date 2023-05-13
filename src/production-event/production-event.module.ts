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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductionEvent.name, schema: ProductionEventSchema },
    ]),
    InventoryModule,
  ],
  controllers: [ProductionEventController],
  providers: [ProductionEventService, ProductionEventHelperService],
})
export class ProductionEventModule {}
