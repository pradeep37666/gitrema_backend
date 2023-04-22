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
import { PackageService } from './package.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { PackageDocument } from './schemas/package.schema';

@Controller('package')
@ApiTags('Packages')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post()
  @PermissionGuard(PermissionSubject.Package, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreatePackageDto) {
    return await this.packageService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.Package, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<PackageDocument>> {
    return await this.packageService.findAll(req, paginateOptions);
  }

  @Get(':packageId')
  @PermissionGuard(PermissionSubject.Package, Permission.Common.FETCH)
  async findOne(@Param('packageId') packageId: string) {
    return await this.packageService.findOne(packageId);
  }

  @Patch(':packageId')
  @PermissionGuard(PermissionSubject.Package, Permission.Common.UPDATE)
  async update(
    @Req() req,
    @Param('packageId') packageId: string,
    @Body() dto: UpdatePackageDto,
  ) {
    return await this.packageService.update(req, packageId, dto);
  }

  @Delete(':packageId')
  @PermissionGuard(PermissionSubject.Package, Permission.Common.DELETE)
  async remove(@Param('packageId') packageId: string) {
    return await this.packageService.remove(packageId);
  }
}
