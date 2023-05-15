import { Module } from '@nestjs/common';
import { WasteEventService } from './waste-event.service';
import { WasteEventController } from './waste-event.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WasteEvent, WasteEventSchema } from './schema/waste-event.schema';
import { InventoryModule } from 'src/inventory/inventory.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WasteEvent.name, schema: WasteEventSchema },
    ]),
    InventoryModule,
  ],
  controllers: [WasteEventController],
  providers: [WasteEventService],
})
export class WasteEventModule {}
