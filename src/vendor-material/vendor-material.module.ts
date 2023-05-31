import { Module } from '@nestjs/common';
import { VendorMaterialService } from './vendor-material.service';
import { VendorMaterialController } from './vendor-material.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  VendorMaterial,
  VendorMaterialSchema,
} from './schemas/vendor-material.schema';
import { UnitOfMeasureModule } from 'src/unit-of-measure/unit-of-measure.module';
import {
  CustomerCondition,
  CustomerConditionSchema,
} from 'src/customer-condition/schema/customer-condition.schema';
import {
  SelectedVendor,
  SelectedVendorSchema,
} from 'src/selected-vendor/schema/selected-vendor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VendorMaterial.name, schema: VendorMaterialSchema },
      { name: CustomerCondition.name, schema: CustomerConditionSchema },
      { name: SelectedVendor.name, schema: SelectedVendorSchema },
    ]),
    UnitOfMeasureModule,
  ],
  controllers: [VendorMaterialController],
  providers: [VendorMaterialService],
})
export class VendorMaterialModule {}
