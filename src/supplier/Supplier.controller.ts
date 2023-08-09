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
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';

import {
  AddSupplierDto,
  AssignPackageDto,
  SupplierQueryDto,
  UpdateSupplierDto,
  UpdateSupplierMarketPlacesDto,
  VendoryQueryDto,
} from './Supplier.dto';
import { SupplierService } from './Supplier.service';

import { PaginateResult } from 'mongoose';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { Supplier, SupplierDocument } from './schemas/suppliers.schema';
import { PaginationDto } from 'src/core/Constants/pagination';
import { SupplierPackageDocument } from './schemas/supplier-package.schema';
import { SupplierAggregated } from './interfaces/suppliers.interface';

@ApiTags('Suppliers')
@Controller('supplier')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @PermissionGuard(PermissionSubject.Supplier, Permission.Common.CREATE)
  addSupplier(
    @Req() req,
    @Body() supplierDetails: AddSupplierDto,
  ): Promise<SupplierDocument> {
    return this.supplierService.createSupplier(req, supplierDetails);
  }

  @Get()
  @PermissionGuard(PermissionSubject.Supplier, Permission.Common.LIST)
  getAll(
    @Query() query: SupplierQueryDto,
    @Query() paginationOptions: PaginationDto,
  ): Promise<PaginateResult<SupplierDocument>> {
    return this.supplierService.getAll(query, paginationOptions);
  }

  @Get('get-vendors')
  @PermissionGuard(PermissionSubject.Supplier, Permission.Supplier.ListVendors)
  getAllVendors(
    @Query() query: VendoryQueryDto,
    @Query() paginationOptions: PaginationDto,
  ): Promise<PaginateResult<SupplierDocument>> {
    return this.supplierService.getAllVendors(query, paginationOptions);
  }

  @Get(':supplierId')
  @PermissionGuard(PermissionSubject.Supplier, Permission.Common.FETCH)
  fetchSingleSupplier(
    @Param('supplierId') supplierId: string,
  ): Promise<SupplierDocument> {
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

  @Put(':supplierId/market-places')
  @PermissionGuard(PermissionSubject.Admin, Permission.Common.UPDATE)
  updateSupplierMarketPlaces(
    @Param('supplierId') supplierId: string,
    @Body() supplierDetails: UpdateSupplierMarketPlacesDto,
  ): Promise<Supplier> {
    return this.supplierService.updateMarketPlaces(supplierId, supplierDetails);
  }

  @Post(':supplierId/assign-package')
  @PermissionGuard(PermissionSubject.Supplier, Permission.Common.UPDATE)
  async assignPackage(
    @Req() req,
    @Param('supplierId') supplierId: string,
    @Body() dto: AssignPackageDto,
  ): Promise<SupplierPackageDocument> {
    return await this.supplierService.assignPackage(req, supplierId, dto);
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
