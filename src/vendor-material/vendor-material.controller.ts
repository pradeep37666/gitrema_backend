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
import { VendorMaterialService } from './vendor-material.service';
import { CreateVendorMaterialDto } from './dto/create-vendor-material.dto';
import { UpdateVendorMaterialDto } from './dto/update-vendor-material.dto';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { I18n, I18nContext } from 'nestjs-i18n';
import { QueryVendorMaterialDto } from './dto/query-vendor-material.dto';
import { PaginateResult } from 'mongoose';
import { PaginationDto } from 'src/core/Constants/pagination';
import { VendorMaterialDocument } from './schemas/vendor-material.schema';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';

@Controller('vendor-material')
@ApiTags('Vendor Material')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class VendorMaterialController {
  constructor(private readonly vendorMaterialService: VendorMaterialService) {}

  @Post()
  @PermissionGuard(PermissionSubject.VendorMaterial, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreateVendorMaterialDto) {
    return await this.vendorMaterialService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.VendorMaterial, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryVendorMaterialDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<VendorMaterialDocument>> {
    return await this.vendorMaterialService.findAll(
      req,
      query,
      paginateOptions,
    );
  }

  @Get(':vendorMaterialId')
  @PermissionGuard(PermissionSubject.VendorMaterial, Permission.Common.FETCH)
  async findOne(
    @Param('vendorMaterialId') vendorMaterialId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.vendorMaterialService.findOne(vendorMaterialId, i18n);
  }

  @Patch(':vendorMaterialId')
  @PermissionGuard(PermissionSubject.VendorMaterial, Permission.Common.UPDATE)
  async update(
    @Param('vendorMaterialId') vendorMaterialId: string,
    @Body() dto: UpdateVendorMaterialDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.vendorMaterialService.update(vendorMaterialId, dto, i18n);
  }

  @Delete(':vendorMaterialId')
  @PermissionGuard(PermissionSubject.VendorMaterial, Permission.Common.DELETE)
  async remove(
    @Param('vendorMaterialId') vendorMaterialId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.vendorMaterialService.remove(vendorMaterialId, i18n);
  }
}
