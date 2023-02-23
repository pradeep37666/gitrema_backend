import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import {
  AddSupplierDto,
  SupplierQueryDto,
  UpdateSupplierDto,
} from './Supplier.dto';
import { SupplierService } from './Supplier.service';

import { PaginateResult } from 'mongoose';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import {
  Supplier,
  SupplierAggregated,
  SupplierDocument,
} from './schemas/suppliers.schema';
import { PaginationDto } from 'src/core/Constants/pagination';

@ApiTags('Suppliers')
@Controller('supplier')
@ApiBearerAuth('access-token')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @PermissionGuard(PermissionSubject.Supplier, Permission.Common.CREATE)
  addSupplier(
    @Body() supplierDetails: AddSupplierDto,
  ): Promise<SupplierDocument> {
    return this.supplierService.createSupplier(supplierDetails);
  }

  @Get()
  @PermissionGuard(PermissionSubject.Supplier, Permission.Common.LIST)
  getAll(
    @Query() query: SupplierQueryDto,
    paginationOptions: PaginationDto,
  ): Promise<PaginateResult<SupplierDocument>> {
    return this.supplierService.getAll(query, paginationOptions);
  }

  @Get(':supplierId')
  @PermissionGuard(PermissionSubject.Supplier, Permission.Common.FETCH)
  fetchSingleSupplier(
    @Param('supplierId') supplierId: string,
  ): Promise<Supplier> {
    return this.supplierService.getOne(supplierId);
  }

  @Get('self')
  @PermissionGuard(PermissionSubject.Business, Permission.Common.FETCH)
  fetchSelfSupplier(@Req() req): Promise<Supplier> {
    return this.supplierService.getOne(req.user.supplierId);
  }

  @Get('self-aggregated')
  @PermissionGuard(PermissionSubject.Business, Permission.Common.FETCH)
  fetchSelfSupplierAggregated(@Req() req): Promise<SupplierAggregated | any> {
    return this.supplierService.getAggregatedOne(req.user.supplierId);
  }

  @Put('self-update')
  @PermissionGuard(PermissionSubject.Business, Permission.Common.UPDATE)
  updateSelfSupplier(
    @Req() req,
    @Body() supplierDetails: UpdateSupplierDto,
  ): Promise<Supplier> {
    return this.supplierService.update(req.user.supplierId, supplierDetails);
  }

  @Put(':supplierId')
  @PermissionGuard(PermissionSubject.Supplier, Permission.Common.UPDATE)
  updateSupplier(
    @Param('supplierId') supplierId: string,
    @Body() supplierDetails: UpdateSupplierDto,
  ): Promise<Supplier> {
    return this.supplierService.update(supplierId, supplierDetails);
  }

  @Delete(':supplierId')
  @PermissionGuard(PermissionSubject.Supplier, Permission.Common.DELETE)
  deleteSupplier(@Param('supplierId') supplierId: string): Promise<Supplier> {
    return this.supplierService.delete(supplierId);
  }
  @Get('check-domain')
  @PermissionGuard(PermissionSubject.Supplier, Permission.Common.FETCH)
  async isDomainAvailable(@Query('domain') domain: string): Promise<boolean> {
    return await this.supplierService.isDomainAvailableToUse(domain);
  }
}
