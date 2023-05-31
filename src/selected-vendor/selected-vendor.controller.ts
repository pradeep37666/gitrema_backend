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
import { SelectedVendorService } from './selected-vendor.service';
import { CreateSelectedVendorDto } from './dto/create-selected-vendor.dto';
import { UpdateSelectedVendorDto } from './dto/update-selected-vendor.dto';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { I18n, I18nContext } from 'nestjs-i18n';
import { QuerySelectedVendorDto } from './dto/query-selected-vendor.dto';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { SelectedVendorDocument } from './schema/selected-vendor.schema';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';

@Controller('vendor-info')
@ApiTags('Vendor Info')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class SelectedVendorController {
  constructor(private readonly selectedVendorService: SelectedVendorService) {}

  @Post()
  @PermissionGuard(PermissionSubject.SelectedVendor, Permission.Common.CREATE)
  async create(
    @Req() req,
    @Body() dto: CreateSelectedVendorDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.selectedVendorService.create(req, dto, i18n);
  }

  @Get()
  @PermissionGuard(PermissionSubject.SelectedVendor, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QuerySelectedVendorDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<SelectedVendorDocument>> {
    return await this.selectedVendorService.findAll(
      req,
      query,
      paginateOptions,
    );
  }

  @Get(':selectedVendorId')
  @PermissionGuard(PermissionSubject.SelectedVendor, Permission.Common.FETCH)
  async findOne(
    @Param('selectedVendorId') selectedVendorId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.selectedVendorService.findOne(selectedVendorId, i18n);
  }

  @Patch(':selectedVendorId')
  @PermissionGuard(PermissionSubject.SelectedVendor, Permission.Common.UPDATE)
  async update(
    @Req() req,
    @Param('selectedVendorId') selectedVendorId: string,
    @Body() dto: UpdateSelectedVendorDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.selectedVendorService.update(
      req,
      selectedVendorId,
      dto,
      i18n,
    );
  }

  @Delete(':selectedVendorId')
  @PermissionGuard(PermissionSubject.SelectedVendor, Permission.Common.DELETE)
  async remove(
    @Param('selectedVendorId') selectedVendorId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.selectedVendorService.remove(selectedVendorId, i18n);
  }
}
