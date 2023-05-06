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
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { QueryVendorDto } from './dto/query-vendor.dto';
import { PaginateResult } from 'mongoose';
import { VendorDocument } from './schemas/vendor.schema';
import { PaginationDto } from 'src/core/Constants/pagination';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';

@Controller('vendor')
@ApiTags('Vendors')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post()
  @PermissionGuard(PermissionSubject.Vendor, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreateVendorDto) {
    return await this.vendorService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.Vendor, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryVendorDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<VendorDocument>> {
    return await this.vendorService.findAll(req, query, paginateOptions);
  }

  @Get(':vendorId')
  @PermissionGuard(PermissionSubject.Vendor, Permission.Common.FETCH)
  async findOne(
    @Param('vendorId') vendorId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.vendorService.findOne(vendorId, i18n);
  }

  @Patch(':vendorId')
  @PermissionGuard(PermissionSubject.Vendor, Permission.Common.UPDATE)
  async update(
    @Param('vendorId') vendorId: string,
    @Body() dto: UpdateVendorDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.vendorService.update(vendorId, dto, i18n);
  }

  @Delete(':vendorId')
  @PermissionGuard(PermissionSubject.Vendor, Permission.Common.DELETE)
  async remove(@Param('vendorId') vendorId: string, @I18n() i18n: I18nContext) {
    return await this.vendorService.remove(vendorId, i18n);
  }
}
