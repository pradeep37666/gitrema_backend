import { Module } from '@nestjs/common';
import { PackageService } from './package.service';
import { PackageController } from './package.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Package, PackageSchema } from './schemas/package.schema';
import { SupplierModule } from 'src/supplier/Supplier.module';
import {
  SupplierPackage,
  SupplierPackageSchema,
} from 'src/supplier/schemas/supplier-package.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Package.name, schema: PackageSchema },
      { name: SupplierPackage.name, schema: SupplierPackageSchema },
    ]),
    SupplierModule,
  ],
  controllers: [PackageController],
  providers: [PackageService],
})
export class PackageModule {}
