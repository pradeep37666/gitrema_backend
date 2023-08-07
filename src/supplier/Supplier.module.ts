import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SupplierController } from './Supplier.controller';
import { SupplierService } from './Supplier.service';
import { Supplier, SupplierSchema } from './schemas/suppliers.schema';
import { MenuItem, MenuItemSchema } from 'src/menu/schemas/menu-item.schema';
import {
  MenuAddition,
  MenuAdditionSchema,
} from 'src/menu/schemas/menu-addition.schema';
import { Package, PackageSchema } from 'src/package/schemas/package.schema';
import {
  SupplierPackage,
  SupplierPackageSchema,
} from './schemas/supplier-package.schema';
import { TestDataModule } from 'src/test-data/test-data.module';
import { CacheModule } from 'src/cache/cache.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Supplier.name, schema: SupplierSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: MenuAddition.name, schema: MenuAdditionSchema },
      { name: Package.name, schema: PackageSchema },
      { name: SupplierPackage.name, schema: SupplierPackageSchema },
    ]),
    forwardRef(() => TestDataModule),
    CacheModule,
  ],
  controllers: [SupplierController],
  providers: [SupplierService],
  exports: [SupplierService],
})
export class SupplierModule {}
