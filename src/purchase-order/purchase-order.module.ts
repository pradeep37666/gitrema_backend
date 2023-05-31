import { Module } from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderController } from './purchase-order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PurchaseOrder,
  PurchaseOrderSchema,
} from './schemas/purchase-order.schema';
import { Material, MaterialSchema } from 'src/material/schemas/material.schema';
import {
  RestaurantMaterial,
  RestaurantMaterialSchema,
} from 'src/material/schemas/restaurant-material.schema';
import { UnitOfMeasureModule } from 'src/unit-of-measure/unit-of-measure.module';
import {
  Restaurant,
  RestaurantSchema,
} from 'src/restaurant/schemas/restaurant.schema';
import { Vendor, VendorSchema } from 'src/vendor/schemas/vendor.schema';
import {
  UnitOfMeasure,
  UnitOfMeasureSchema,
} from 'src/unit-of-measure/schemas/unit-of-measure.schema';
import { PurchaseOrderHelperService } from './purchase-order-helper.service';
import {
  SelectedVendor,
  SelectedVendorSchema,
} from 'src/selected-vendor/schema/selected-vendor.schema';
import {
  Supplier,
  SupplierSchema,
} from 'src/supplier/schemas/suppliers.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PurchaseOrder.name, schema: PurchaseOrderSchema },
      { name: Material.name, schema: MaterialSchema },
      { name: RestaurantMaterial.name, schema: RestaurantMaterialSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Supplier.name, schema: SupplierSchema },
      { name: UnitOfMeasure.name, schema: UnitOfMeasureSchema },
      { name: SelectedVendor.name, schema: SelectedVendorSchema },
    ]),
    UnitOfMeasureModule,
  ],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService, PurchaseOrderHelperService],
  exports: [PurchaseOrderHelperService],
})
export class PurchaseOrderModule {}
