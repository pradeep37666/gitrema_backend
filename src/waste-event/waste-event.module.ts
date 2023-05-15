import { Module } from '@nestjs/common';
import { WasteEventService } from './waste-event.service';
import { WasteEventController } from './waste-event.controller';

@Module({
  controllers: [WasteEventController],
  providers: [WasteEventService]
})
export class WasteEventModule {}
