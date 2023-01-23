import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PermissionService } from './permission.service';
import { Role, RoleSchema } from 'src/role/schemas/roles.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
  ],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
