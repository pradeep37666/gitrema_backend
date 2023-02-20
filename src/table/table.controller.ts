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
import { AggregatePaginateResult, PaginateResult } from 'mongoose';
import { TableDocument } from './schemas/table.schema';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QueryTableDto } from './dto/query-table.dto';
import { TableLogDto } from './dto/table-log.dto';
import { TableLogService } from './table-log.service';
import { TableLogDocument } from './schemas/table-log.schema';

@Controller('table')
@ApiTags('Tables')
@ApiBearerAuth('access-token')
export class TableController {
  constructor(
    private readonly tableService: TableService,
    private readonly tableLogService: TableLogService,
  ) {}

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
  ): Promise<AggregatePaginateResult<TableDocument>> {
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

  @Patch(':tableId/start-table')
  @PermissionGuard(PermissionSubject.Table, Permission.Common.UPDATE)
  async startTable(@Param('tableId') tableId: string) {
    return await this.tableLogService.logTable(tableId);
  }

  @Patch(':tableId/close-table')
  @PermissionGuard(PermissionSubject.Table, Permission.Common.UPDATE)
  async closeTable(@Param('tableId') tableId: string) {
    return await this.tableLogService.logTable(tableId, false);
  }

  @Patch(':tableId/update-log')
  @PermissionGuard(PermissionSubject.Table, Permission.Common.UPDATE)
  async updateLog(@Param('tableId') tableId: string, @Body() dto: TableLogDto) {
    return await this.tableLogService.updateLog(tableId, dto);
  }

  @Get(':tableId/logs')
  @PermissionGuard(PermissionSubject.Cashier, Permission.Common.FETCH)
  async logs(
    @Req() req,
    @Param('tableId') tableId: string,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<TableLogDocument>> {
    return await this.tableLogService.logs(req, tableId, paginateOptions);
  }

  @Delete(':tableId')
  @PermissionGuard(PermissionSubject.Table, Permission.Common.DELETE)
  async remove(@Param('tableId') tableId: string) {
    return await this.tableService.remove(tableId);
  }
}
