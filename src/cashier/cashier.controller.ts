import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
  Req,
} from '@nestjs/common';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CashierService } from './cashier.service';
import { CreateCashierDto } from './dto/create-cashier.dto';
import { UpdateCashierDto } from './dto/update-cashier.dto';
import { CashierDocument } from './schemas/cashier.schema';

@Controller('cashier')
@ApiTags('Cashiers')
@ApiBearerAuth('access-token')
export class CashierController {
  constructor(private readonly cashierService: CashierService) {}

  @Post()
  @PermissionGuard(PermissionSubject.Cashier, Permission.Common.CREATE)
  async create(@Req() req, @Body() createCashierDto: CreateCashierDto) {
    return await this.cashierService.create(req, createCashierDto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.Cashier, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<CashierDocument>> {
    return await this.cashierService.findAll(req, paginateOptions);
  }

  @Get(':cashierId')
  @PermissionGuard(PermissionSubject.Cashier, Permission.Common.FETCH)
  async findOne(@Param('cashierId') cashierId: string) {
    return await this.cashierService.findOne(cashierId);
  }

  @Patch(':cashierId')
  @PermissionGuard(PermissionSubject.Cashier, Permission.Common.UPDATE)
  async update(
    @Param('cashierId') cashierId: string,
    @Body() updateCashierDto: UpdateCashierDto,
  ) {
    return await this.cashierService.update(cashierId, updateCashierDto);
  }

  @Delete(':cashierId')
  @PermissionGuard(PermissionSubject.Cashier, Permission.Common.DELETE)
  async remove(@Param('cashierId') cashierId: string) {
    return await this.cashierService.remove(cashierId);
  }
}
