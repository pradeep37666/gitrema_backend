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
import { ClientCommentService } from './client-comment.service';
import { CreateClientCommentDto } from './dto/create-client-comment.dto';

import { PaginateResult } from 'mongoose';
import { PaginationDto } from 'src/core/Constants/pagination';
import { ClientCommentDocument } from './schemas/client-comment.schema';
import { QueryKitchenQueueDto } from 'src/kitchen-queue/dto/query-kitchen-queue.dto';
import { Permission } from 'src/core/Constants/permission.type';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';

@Controller('client-comment')
@ApiTags('Client Comments')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class ClientCommentController {
  constructor(private readonly clientCommentService: ClientCommentService) {}

  @Post()
  @PermissionGuard(PermissionSubject.ClientComment, Permission.Common.CREATE)
  create(@Req() req, @Body() createClientCommentDto: CreateClientCommentDto) {
    return this.clientCommentService.create(req, createClientCommentDto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.ClientComment, Permission.Common.LIST)
  findAll(
    @Req() req,
    @Query() query: QueryKitchenQueueDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<ClientCommentDocument>> {
    return this.clientCommentService.findAll(req, query, paginateOptions);
  }
}
