import { Module } from '@nestjs/common';
import { CustomerConditionService } from './customer-condition.service';
import { CustomerConditionController } from './customer-condition.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CustomerCondition,
  CustomerConditionSchema,
} from './schema/customer-condition.schema';
import { UnitOfMeasureModule } from 'src/unit-of-measure/unit-of-measure.module';
import {
  SelectedVendor,
  SelectedVendorSchema,
} from 'src/selected-vendor/schema/selected-vendor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomerCondition.name, schema: CustomerConditionSchema },
      { name: SelectedVendor.name, schema: SelectedVendorSchema },
    ]),
    UnitOfMeasureModule,
  ],
  controllers: [CustomerConditionController],
  providers: [CustomerConditionService],
})
export class CustomerConditionModule {}
