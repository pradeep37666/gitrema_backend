import { Module } from '@nestjs/common';
import { CostSimulatorService } from './cost-simulator.service';
import { CostSimulatorController } from './cost-simulator.controller';
import { RawMaterialService } from './raw-material.service';
import { RawMaterialController } from './raw-material.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CostSimulator,
  CostSimulatorSchema,
} from './schema/cost-simulator.schema';
import { RawMaterial, RawMaterialSchema } from './schema/raw-material.schema';
import { CostSimulatorHelperService } from './cost-simulator-helper.service';
import { UnitOfMeasureModule } from 'src/unit-of-measure/unit-of-measure.module';
import { ProductReportService } from './product-report.service';
import { ProductReportController } from './product-report.controller';
import {
  ProductReport,
  ProductReportSchema,
} from './schema/product-report.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CostSimulator.name, schema: CostSimulatorSchema },
      { name: RawMaterial.name, schema: RawMaterialSchema },
      { name: ProductReport.name, schema: ProductReportSchema },
    ]),
    UnitOfMeasureModule,
  ],
  controllers: [
    CostSimulatorController,
    RawMaterialController,
    ProductReportController,
  ],
  providers: [
    CostSimulatorService,
    RawMaterialService,
    CostSimulatorHelperService,
    ProductReportService,
  ],
})
export class CostSimulatorModule {}
