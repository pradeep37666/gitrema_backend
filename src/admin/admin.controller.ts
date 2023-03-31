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
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { PaginateResult } from 'mongoose';
import { PaginationDto } from 'src/core/Constants/pagination';
import { Admin, AdminDocument } from 'src/admin/schemas/admin.schema';

@Controller('admin')
@ApiTags('Admins')
@ApiBearerAuth('access-token')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @PermissionGuard(PermissionSubject.Admin, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreateAdminDto) {
    return await this.adminService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.Admin, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<AdminDocument>> {
    return await this.adminService.findAll(req, paginateOptions);
  }

  @Get(':adminId')
  @PermissionGuard(PermissionSubject.Admin, Permission.Common.FETCH)
  async findOne(@Param('adminId') adminId: string) {
    return await this.adminService.findOne(adminId);
  }

  @Patch(':adminId')
  @PermissionGuard(PermissionSubject.Admin, Permission.Common.UPDATE)
  async update(
    @Req() req,
    @Param('adminId') adminId: string,
    @Body() dto: UpdateAdminDto,
  ) {
    return await this.adminService.update(req, adminId, dto);
  }

  @Delete(':adminId')
  @PermissionGuard(PermissionSubject.Admin, Permission.Common.DELETE)
  async remove(@Param('adminId') adminId: string) {
    return await this.adminService.remove(adminId);
  }
}
