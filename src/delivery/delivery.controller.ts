import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { DeliveryService } from './delivery.service';

import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { QueryDeliveryDto } from './dto/query-delivery.dto';
import { PaginationDto } from 'src/core/Constants/pagination';
import { DeliveryDocument } from './schemas/delivery.schema';
import { PaginateResult } from 'mongoose';
import { Public } from 'src/core/decorators/public.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('delivery')
@ApiTags('Deliveries')
@ApiBearerAuth('access-token')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get()
  @PermissionGuard(PermissionSubject.Delivery, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryDeliveryDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<DeliveryDocument>> {
    return await this.deliveryService.findAll(req, query, paginateOptions);
  }

  @Patch('update-delivery')
  @Public()
  async update(@Body() dto: any) {
    return await this.deliveryService.updateHook(dto);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.deliveryService.findOne(+id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateDeliveryDto: UpdateDeliveryDto,
  // ) {
  //   return this.deliveryService.update(+id, updateDeliveryDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.deliveryService.remove(+id);
  // }
}
