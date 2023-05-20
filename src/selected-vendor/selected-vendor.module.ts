import { Module } from '@nestjs/common';
import { SelectedVendorService } from './selected-vendor.service';
import { SelectedVendorController } from './selected-vendor.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SelectedVendor,
  SelectedVendorSchema,
} from './schema/selected-vendor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SelectedVendor.name, schema: SelectedVendorSchema },
    ]),
  ],
  controllers: [SelectedVendorController],
  providers: [SelectedVendorService],
})
export class SelectedVendorModule {}
