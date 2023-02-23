import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PermissionService } from './permission.service';
import { Role, RoleSchema } from 'src/role/schemas/roles.schema';
import { PermissionGuard } from './permission.guard';
import {
  SupplierPackage,
  SupplierPackageSchema,
} from 'src/supplier/schemas/supplier-package.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: SupplierPackage.name, schema: SupplierPackageSchema },
    ]),
  ],
  providers: [PermissionService, PermissionGuard],
  exports: [PermissionService],
})
export class PermissionModule {}
