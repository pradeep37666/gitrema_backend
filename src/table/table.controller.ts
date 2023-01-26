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
import { TableService } from './table.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { TableDocument } from './schemas/table.schema';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QueryTableDto } from './dto/query-table.dto';

@Controller('table')
@ApiTags('Tables')
@ApiBearerAuth('access-token')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post()
  @PermissionGuard(PermissionSubject.Table, Permission.Common.CREATE)
  async create(@Req() req, @Body() createTableDto: CreateTableDto) {
    return await this.tableService.create(req, createTableDto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.Table, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryTableDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<TableDocument>> {
    return await this.tableService.findAll(req, query, paginateOptions);
  }

  @Get(':tableId')
  @PermissionGuard(PermissionSubject.Table, Permission.Common.FETCH)
  async findOne(@Param('tableId') tableId: string) {
    return await this.tableService.findOne(tableId);
  }

  @Patch(':tableId')
  @PermissionGuard(PermissionSubject.Table, Permission.Common.UPDATE)
  async update(
    @Param('tableId') tableId: string,
    @Body() updateTableDto: UpdateTableDto,
  ) {
    return await this.tableService.update(tableId, updateTableDto);
  }

  @Delete(':tableId')
  @PermissionGuard(PermissionSubject.Table, Permission.Common.DELETE)
  async remove(@Param('tableId') tableId: string) {
    return await this.tableService.remove(tableId);
  }
}
