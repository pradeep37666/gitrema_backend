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
import { ListService } from './list.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { ListDocument } from './schemas/list.schema';

@Controller('list')
@ApiTags('List')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Post()
  @PermissionGuard(PermissionSubject.List, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreateListDto) {
    return await this.listService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.List, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<ListDocument>> {
    return await this.listService.findAll(req, paginateOptions);
  }

  @Get(':listId')
  @PermissionGuard(PermissionSubject.List, Permission.Common.FETCH)
  async findOne(@Param('listId') listId: string) {
    return await this.listService.findOne(listId);
  }

  @Patch(':listId')
  @PermissionGuard(PermissionSubject.List, Permission.Common.UPDATE)
  async update(@Param('listId') listId: string, @Body() dto: UpdateListDto) {
    return await this.listService.update(listId, dto);
  }

  @Delete(':listId')
  @PermissionGuard(PermissionSubject.List, Permission.Common.DELETE)
  async remove(@Param('listId') listId: string) {
    return await this.listService.remove(listId);
  }
}
