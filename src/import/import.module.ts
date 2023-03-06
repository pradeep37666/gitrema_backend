import { Module } from '@nestjs/common';
import { ImportService } from './import.service';
import { ImportController } from './import.controller';
import { SupplierModule } from 'src/supplier/Supplier.module';
import { StorageModule } from 'src/core/Providers/Storage/storage.module';
import { UserModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Import, ImportSchema } from './schemas/import.schema';
import { Role, RoleSchema } from 'src/role/schemas/roles.schema';
import { ImportHelperService } from './import-helper.service';
import { RestaurantModule } from 'src/restaurant/restaurant.module';

@Module({
  imports: [
    StorageModule,
    SupplierModule,
    UserModule,
    RestaurantModule,
    MongooseModule.forFeature([
      { name: Import.name, schema: ImportSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [ImportController],
  providers: [ImportService, ImportHelperService],
  exports: [ImportHelperService],
})
export class ImportModule {}
