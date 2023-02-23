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
import {
  CloseCashierDto,
  OpenCashierDto,
  OverrideCloseCashierDto,
} from './dto/cashier-log.dto';
import { CashierLogDocument } from './schemas/cashier-log.schema';
import { CashierLogService } from './cashier-log.service';
import { PauseDto } from './dto/pause.dto';

@Controller('cashier')
@ApiTags('Cashiers')
@ApiBearerAuth('access-token')
export class CashierController {
  constructor(
    private readonly cashierService: CashierService,
    private readonly cashierLogService: CashierLogService,
  ) {}

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

  @Post('start')
  @PermissionGuard(PermissionSubject.Cashier, Permission.Common.START)
  async start(@Req() req, @Body() dto: OpenCashierDto) {
    return await this.cashierLogService.start(req, dto);
  }

  @Post('close')
  @PermissionGuard(PermissionSubject.Cashier, Permission.Common.CLOSE)
  async close(@Req() req, @Body() dto: CloseCashierDto) {
    return await this.cashierLogService.close(req, dto);
  }

  @Post('override-close')
  @PermissionGuard(
    PermissionSubject.Cashier,
    Permission.Cashier.OverrideCashierClose,
  )
  async overrideClose(@Req() req, @Body() dto: OverrideCloseCashierDto) {
    return await this.cashierLogService.close(req, dto);
  }

  @Post(':cashierId/pause')
  @PermissionGuard(PermissionSubject.Cashier, Permission.Common.PAUSE)
  async pause(@Param('cashierId') cashierId: string, @Body() dto: PauseDto) {
    return await this.cashierLogService.pause(cashierId, dto);
  }

  @Post(':cashierId/resume')
  @PermissionGuard(PermissionSubject.Cashier, Permission.Common.RESUME)
  async resume(@Param('cashierId') cashierId: string) {
    return await this.cashierLogService.pause(cashierId);
  }

  @Get(':cashierId/current-log')
  @PermissionGuard(PermissionSubject.Cashier, Permission.Common.FETCH)
  async currentLog(@Param('cashierId') cashierId: string) {
    return await this.cashierLogService.current(cashierId);
  }

  @Get(':cashierId/logs')
  @PermissionGuard(PermissionSubject.Cashier, Permission.Common.FETCH)
  async logs(
    @Req() req,
    @Param('cashierId') cashierId: string,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<CashierLogDocument>> {
    return await this.cashierLogService.logs(req, cashierId, paginateOptions);
  }

  @Delete(':cashierId')
  @PermissionGuard(PermissionSubject.Cashier, Permission.Common.DELETE)
  async remove(@Param('cashierId') cashierId: string) {
    return await this.cashierService.remove(cashierId);
  }
}
