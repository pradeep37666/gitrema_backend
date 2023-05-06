import { Module } from '@nestjs/common';
import { UnitOfMeasureService } from './unit-of-measure.service';
import { UnitOfMeasureController } from './unit-of-measure.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UnitOfMeasure,
  UnitOfMeasureSchema,
} from './schemas/unit-of-measure.schema';
import { UnitOfMeasureHelperService } from './unit-of-measure-helper.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UnitOfMeasure.name, schema: UnitOfMeasureSchema },
    ]),
  ],
  controllers: [UnitOfMeasureController],
  providers: [UnitOfMeasureService, UnitOfMeasureHelperService],
  exports: [UnitOfMeasureService, UnitOfMeasureHelperService],
})
export class UnitOfMeasureModule {}
