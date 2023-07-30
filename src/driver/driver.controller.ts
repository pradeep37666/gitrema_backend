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
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { DriverDocument } from './schema/driver.schema';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';

@Controller('driver')
@ApiTags('Drivers')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post()
  @PermissionGuard(PermissionSubject.Driver, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreateDriverDto) {
    return await this.driverService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.Driver, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<DriverDocument>> {
    return await this.driverService.findAll(req, paginateOptions);
  }

  @Get(':driverId')
  @PermissionGuard(PermissionSubject.Driver, Permission.Common.FETCH)
  async findOne(
    @Param('driverId') driverId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.driverService.findOne(driverId, i18n);
  }

  @Patch(':driverId')
  @PermissionGuard(PermissionSubject.Driver, Permission.Common.UPDATE)
  async update(
    @Param('driverId') driverId: string,
    @Body() dto: UpdateDriverDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.driverService.update(driverId, dto, i18n);
  }

  @Delete(':driverId')
  @PermissionGuard(PermissionSubject.Driver, Permission.Common.DELETE)
  async remove(@Param('driverId') driverId: string, @I18n() i18n: I18nContext) {
    return await this.driverService.remove(driverId, i18n);
  }
}
