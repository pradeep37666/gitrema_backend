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
import { KitchenQueueService } from './kitchen-queue.service';
import { CreateKitchenQueueDto } from './dto/create-kitchen-queue.dto';
import { UpdateKitchenQueueDto } from './dto/update-kitchen-queue.dto';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { QueryKitchenQueueDto } from './dto/query-kitchen-queue.dto';
import { KitchenQueueDocument } from './schemas/kitchen-queue.schema';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { KitchenQueueLogService } from './kitchen-queue-log.service';
import { PauseDto } from 'src/cashier/dto/pause.dto';
import { KitchenQueueLogDocument } from './schemas/kitchen-queue-log.schema';

@Controller('kitchen-queue')
@ApiTags('Kitchen Queues')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class KitchenQueueController {
  constructor(
    private readonly kitchenQueueService: KitchenQueueService,
    private readonly kitchenQueueLogService: KitchenQueueLogService,
  ) {}

  @Post()
  @PermissionGuard(PermissionSubject.KitchenQueue, Permission.Common.CREATE)
  async create(
    @Req() req,
    @Body() createKitchenQueueDto: CreateKitchenQueueDto,
  ) {
    return await this.kitchenQueueService.create(req, createKitchenQueueDto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.KitchenQueue, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryKitchenQueueDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<KitchenQueueDocument>> {
    return await this.kitchenQueueService.findAll(req, query, paginateOptions);
  }

  @Get(':kitchenQueueId')
  @PermissionGuard(PermissionSubject.KitchenQueue, Permission.Common.FETCH)
  async findOne(@Param('kitchenQueueId') kitchenQueueId: string) {
    return await this.kitchenQueueService.findOne(kitchenQueueId);
  }

  @Patch(':kitchenQueueId')
  @PermissionGuard(PermissionSubject.KitchenQueue, Permission.Common.UPDATE)
  async update(
    @Param('kitchenQueueId') kitchenQueueId: string,
    @Body() updateKitchenQueueDto: UpdateKitchenQueueDto,
  ) {
    return await this.kitchenQueueService.update(
      kitchenQueueId,
      updateKitchenQueueDto,
    );
  }

  @Delete(':kitchenQueueId')
  @PermissionGuard(PermissionSubject.KitchenQueue, Permission.Common.DELETE)
  async remove(@Param('kitchenQueueId') kitchenQueueId: string) {
    return await this.kitchenQueueService.remove(kitchenQueueId);
  }

  @Post(':kitchenQueueId/start')
  @PermissionGuard(PermissionSubject.KitchenQueue, Permission.Common.START)
  async start(@Req() req, @Param('kitchenQueueId') kitchenQueueId: string) {
    return await this.kitchenQueueLogService.start(req, kitchenQueueId);
  }

  @Post(':kitchenQueueId/close')
  @PermissionGuard(PermissionSubject.KitchenQueue, Permission.Common.CLOSE)
  async close(@Req() req, @Param('kitchenQueueId') kitchenQueueId: string) {
    return await this.kitchenQueueLogService.close(req, kitchenQueueId);
  }

  @Post(':kitchenQueueId/pause')
  @PermissionGuard(PermissionSubject.KitchenQueue, Permission.Common.PAUSE)
  async pause(
    @Param('kitchenQueueId') kitchenQueueId: string,
    @Body() dto: PauseDto,
  ) {
    return await this.kitchenQueueLogService.pause(kitchenQueueId, dto);
  }

  @Post(':kitchenQueueId/resume')
  @PermissionGuard(PermissionSubject.KitchenQueue, Permission.Common.RESUME)
  async resume(@Param('kitchenQueueId') kitchenQueueId: string) {
    return await this.kitchenQueueLogService.pause(kitchenQueueId);
  }

  @Get(':kitchenQueueId/current-log')
  @PermissionGuard(PermissionSubject.KitchenQueue, Permission.Common.FETCH)
  async currentLog(@Param('kitchenQueueId') kitchenQueueId: string) {
    return await this.kitchenQueueLogService.current(kitchenQueueId);
  }

  @Get(':kitchenQueueId/logs')
  @PermissionGuard(PermissionSubject.KitchenQueue, Permission.Common.FETCH)
  async logs(
    @Req() req,
    @Param('kitchenQueueId') kitchenQueueId: string,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<KitchenQueueLogDocument>> {
    return await this.kitchenQueueLogService.logs(
      req,
      kitchenQueueId,
      paginateOptions,
    );
  }
}
