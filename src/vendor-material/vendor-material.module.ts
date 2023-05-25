import { Module } from '@nestjs/common';
import { VendorMaterialService } from './vendor-material.service';
import { VendorMaterialController } from './vendor-material.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  VendorMaterial,
  VendorMaterialSchema,
} from './schemas/vendor-material.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VendorMaterial.name, schema: VendorMaterialSchema },
    ]),
  ],
  controllers: [VendorMaterialController],
  providers: [VendorMaterialService],
})
export class VendorMaterialModule {}
