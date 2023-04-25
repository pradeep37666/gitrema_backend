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
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';

@Controller('delivery')
@ApiTags('Deliveries')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post('update-delivery')
  @Public()
  async update(@Body() dto: any) {
    return await this.deliveryService.updateHook(dto);
  }

  @Get(':orderId')
  findOne(@Param('orderId') orderId: string) {
    return this.deliveryService.findOne(orderId);
  }

  @Get('refresh/:orderId')
  refresh(@Param('orderId') orderId: string) {
    return this.deliveryService.refresh(orderId);
  }

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
