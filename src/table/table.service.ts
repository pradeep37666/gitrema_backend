import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Table, TableDocument } from './schemas/table.schema';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { QueryTableDto } from './dto/query-table.dto';

@Injectable()
export class TableService {
  constructor(
    @InjectModel(Table.name)
    private readonly tableModel: Model<TableDocument>,
    @InjectModel(Table.name)
    private readonly tableModelPag: PaginateModel<TableDocument>,
  ) {}

  async create(req: any, dto: CreateTableDto): Promise<TableDocument> {
    return await this.tableModel.create({ ...dto, addedBy: req.user.userId });
  }

  async findAll(
    req: any,
    query: QueryTableDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<TableDocument>> {
    const tables = await this.tableModelPag.paginate(
      {
        ...query,
        deletedAt: null,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );
    return tables;
  }

  async findOne(tableId: string): Promise<TableDocument> {
    const exists = await this.tableModel.findById(tableId);

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async update(tableId: string, dto: UpdateTableDto): Promise<TableDocument> {
    const table = await this.tableModel.findByIdAndUpdate(tableId, dto, {
      new: true,
    });

    if (!table) {
      throw new NotFoundException();
    }

    return table;
  }

  async remove(tableId: string): Promise<boolean> {
    const table = await this.tableModel.findByIdAndUpdate(
      tableId,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!table) {
      throw new NotFoundException();
    }
    return true;
  }
}
