

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Role, RoleSchema } from 'src/role/schemas/roles.schema';
import { OrderSourceValidationGuard } from './order-source.guard';
import { OrderSourceService } from './order-source.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  providers: [OrderSourceService, OrderSourceValidationGuard],
  exports: [OrderSourceService],
})
export class OrderSourceModule {}
