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
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';

import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationDocument } from './schemas/notification.schema';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Public } from 'src/core/decorators/public.decorator';

@Controller('notification')
@ApiTags('Notification Config')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @PermissionGuard(
    PermissionSubject.NotificationConfig,
    Permission.Common.CREATE,
  )
  async create(@Req() req, @Body() dto: CreateNotificationDto) {
    return await this.notificationService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.NotificationConfig, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryNotificationDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<NotificationDocument>> {
    return await this.notificationService.findAll(req, query, paginateOptions);
  }

  @Get(':notificationId')
  @PermissionGuard(
    PermissionSubject.NotificationConfig,
    Permission.Common.FETCH,
  )
  async findOne(@Param('notificationId') notificationId: string) {
    return await this.notificationService.findOne(notificationId);
  }

  @Patch(':notificationId')
  @PermissionGuard(
    PermissionSubject.NotificationConfig,
    Permission.Common.UPDATE,
  )
  async update(
    @Param('notificationId') notificationId: string,
    @Body() dto: UpdateNotificationDto,
  ) {
    return await this.notificationService.update(notificationId, dto);
  }

  @Delete(':notificationId')
  @PermissionGuard(
    PermissionSubject.NotificationConfig,
    Permission.Common.DELETE,
  )
  async remove(@Param('notificationId') notificationId: string) {
    return await this.notificationService.remove(notificationId);
  }

  // @Post('copy/:supplierId')
  // @Public()
  // async copy(@Param('supplierId') supplierId: string) {
  //   this.notificationService.copy(supplierId);
  //   return true;
  // }
}
