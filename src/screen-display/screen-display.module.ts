import { Module } from '@nestjs/common';
import { ScreenDisplayService } from './screen-display.service';
import { ScreenDisplayController } from './screen-display.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ScreenDisplay,
  ScreenDisplaySchema,
} from './schemas/screen-display.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScreenDisplay.name, schema: ScreenDisplaySchema },
    ]),
  ],
  controllers: [ScreenDisplayController],
  providers: [ScreenDisplayService],
})
export class ScreenDisplayModule {}
