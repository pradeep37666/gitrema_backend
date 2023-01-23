import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
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
import { Supplier, SupplierDocument } from './schemas/suppliers.schema';
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
