import { Module } from '@nestjs/common';
import { InventoryReportService } from './inventory-report.service';
import { InventoryReportController } from './inventory-report.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SelectedVendor,
  SelectedVendorSchema,
} from 'src/selected-vendor/schema/selected-vendor.schema';
import {
  ProfitDetail,
  ProfitDetailSchema,
} from 'src/profit-detail/schema/profit-detail.schema';
import { List, ListSchema } from 'src/list/schemas/list.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SelectedVendor.name, schema: SelectedVendorSchema },
      { name: ProfitDetail.name, schema: ProfitDetailSchema },
      { name: List.name, schema: ListSchema },
    ]),
  ],
  controllers: [InventoryReportController],
  providers: [InventoryReportService],
})
export class InventoryReportModule {}
