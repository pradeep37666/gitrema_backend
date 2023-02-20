import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
  Req,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LeanDocument, PaginateResult } from 'mongoose';

import { RoleCreateDto, RoleUpdateDto } from './role.dto';
import { RoleService } from './role.service';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { RoleDocument } from './schemas/roles.schema';
import { PaginationDto } from 'src/core/Constants/pagination';
import { STATUS_MSG } from 'src/core/Constants/status-message.constants';

@Controller('roles')
@ApiTags('Roles')
@ApiBearerAuth('access-token')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @PermissionGuard(PermissionSubject.Role, Permission.Common.CREATE)
  async create(
    @Req() req,
    @Body() roleDetails: RoleCreateDto,
  ): Promise<RoleDocument> {
    return await this.roleService.create(req, roleDetails);
  }

  @Put(':roleId')
  @PermissionGuard(PermissionSubject.Role, Permission.Common.UPDATE)
  async update(
    @Req() req,
    @Param('roleId') roleId: string,
    @Body() roleDetails: RoleUpdateDto,
  ): Promise<LeanDocument<RoleDocument>> {
    return await this.roleService.update(req, roleId, roleDetails);
  }

  @Get()
  @PermissionGuard(PermissionSubject.Role, Permission.Common.LIST)
  async all(
    @Req() req,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<RoleDocument>> {
    return await this.roleService.all(req, paginateOptions);
  }

  @Get('permissions')
  async permissions(): Promise<any> {
    return { permissions: Permission, subjects: PermissionSubject };
  }

  @Get(':roleId')
  @PermissionGuard(PermissionSubject.Role, Permission.Common.FETCH)
  async fetch(
    @Param('roleId') roleId: string,
  ): Promise<LeanDocument<RoleDocument>> {
    return await this.roleService.fetch(roleId);
  }

  @Delete(':roleId')
  @PermissionGuard(PermissionSubject.Role, Permission.Common.DELETE)
  async delete(@Param('roleId') roleId: string): Promise<any> {
    const deleted = await this.roleService.delete(roleId);
    if (deleted) {
      return STATUS_MSG.SUCCESS.DELETED;
    }
    throw new InternalServerErrorException(STATUS_MSG.ERROR.SERVER_ERROR);
  }
}
