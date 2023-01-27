import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QueryActivityDto } from './dto/query-activity.dto';
import { ActivityDocument } from './schemas/activity.schema';

@Controller('activity')
@ApiTags('Activities')
@ApiBearerAuth('access-token')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @PermissionGuard(PermissionSubject.Activity, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreateActivityDto) {
    return await this.activityService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.Activity, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryActivityDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<ActivityDocument>> {
    return await this.activityService.findAll(req, query, paginateOptions);
  }

  @Get(':activityId')
  @PermissionGuard(PermissionSubject.Activity, Permission.Common.FETCH)
  async findOne(@Param('activityId') activityId: string) {
    return await this.activityService.findOne(activityId);
  }

  @Patch(':activityId')
  @PermissionGuard(PermissionSubject.Activity, Permission.Common.UPDATE)
  async update(
    @Param('activityId') activityId: string,
    @Body() dto: UpdateActivityDto,
  ) {
    return await this.activityService.update(activityId, dto);
  }

  @Delete(':activityId')
  @PermissionGuard(PermissionSubject.Activity, Permission.Common.DELETE)
  async remove(@Param('activityId') activityId: string) {
    return await this.activityService.remove(activityId);
  }
}
