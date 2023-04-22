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
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { WaitingQueueService } from './waiting-queue.service';
import { CreateWaitingQueueDto } from './dto/create-waiting-queue.dto';
import { UpdateWaitingQueueDto } from './dto/update-waiting-queue.dto';
import { WaitingQueueDocument } from './schemas/waiting-queue.schema';
import { QueryWaitingQueueDto } from './dto/query-waiting-queue.dto';

@ApiTags('Waiting Queue')
@ApiBearerAuth('access-token')
@Controller('waiting-queue')
@ApiHeader({ name: 'lang' })
export class WaitingQueueController {
  constructor(private readonly waitingQueueService: WaitingQueueService) {}

  @Post()
  @PermissionGuard(PermissionSubject.WaitingQueue, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreateWaitingQueueDto) {
    return await this.waitingQueueService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.WaitingQueue, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryWaitingQueueDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<WaitingQueueDocument>> {
    return await this.waitingQueueService.findAll(req, query, paginateOptions);
  }

  @Get(':waitingQueueId')
  @PermissionGuard(PermissionSubject.WaitingQueue, Permission.Common.FETCH)
  async findOne(@Param('waitingQueueId') waitingQueueId: string) {
    return await this.waitingQueueService.findOne(waitingQueueId);
  }

  @Patch(':waitingQueueId')
  @PermissionGuard(PermissionSubject.WaitingQueue, Permission.Common.UPDATE)
  async update(
    @Param('waitingQueueId') waitingQueueId: string,
    @Body() dto: UpdateWaitingQueueDto,
  ) {
    return await this.waitingQueueService.update(waitingQueueId, dto);
  }

  @Delete(':waitingQueueId')
  @PermissionGuard(PermissionSubject.WaitingQueue, Permission.Common.DELETE)
  async remove(@Param('waitingQueueId') waitingQueueId: string) {
    return await this.waitingQueueService.remove(waitingQueueId);
  }
}
