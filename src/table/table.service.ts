import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Table, TableDocument } from './schemas/table.schema';
import mongoose, {
  AggregatePaginateModel,
  AggregatePaginateResult,
  Model,
  PaginateModel,
  PaginateResult,
} from 'mongoose';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { QueryTableDto } from './dto/query-table.dto';
import { TableLog, TableLogDocument } from './schemas/table-log.schema';
import { OrderStatus } from 'src/order/enum/en.enum';
import { TableLogDto } from './dto/table-log.dto';

@Injectable()
export class TableService {
  constructor(
    @InjectModel(Table.name)
    private readonly tableModel: Model<TableDocument>,
    @InjectModel(Table.name)
    private readonly tableModelPag: AggregatePaginateModel<TableDocument>,
    @InjectModel(TableLog.name)
    private readonly tableLogModel: Model<TableLogDocument>,
  ) {}

  async create(req: any, dto: CreateTableDto): Promise<TableDocument> {
    return await this.tableModel.create({
      ...dto,
      addedBy: req.user.userId,
      supplierId: req.user.supplierId,
    });
  }

  async findAll(
    req: any,
    query: QueryTableDto,
    paginateOptions: PaginationDto,
  ): Promise<AggregatePaginateResult<TableDocument>> {
    if (query.restaurantId) {
      query.restaurantId = new mongoose.Types.ObjectId(query.restaurantId);
    }
    if (query.tableRegionId) {
      query.tableRegionId = new mongoose.Types.ObjectId(query.tableRegionId);
    }
    return await this.tableModelPag.aggregatePaginate(
      this.tableModelPag.aggregate(
        [
          {
            $match: {
              ...query,
              supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
              deletedAt: null,
            },
          },
          {
            $lookup: {
              from: 'orders',
              let: {
                id: '$_id',
              },
              pipeline: [
                {
                  $match: {
                    $and: [
                      {
                        $expr: {
                          $eq: ['$tableId', '$$id'],
                        },
                      },
                      {
                        status: OrderStatus.New,
                      },
                    ],
                  },
                },
              ],
              as: 'newOrders',
            },
          },
          {
            $lookup: {
              from: 'orders',
              let: {
                id: '$_id',
              },
              pipeline: [
                {
                  $match: {
                    $and: [
                      {
                        $expr: {
                          $eq: ['$tableId', '$$id'],
                        },
                      },
                      {
                        status: OrderStatus.SentToKitchen,
                      },
                    ],
                  },
                },
              ],
              as: 'processingOrders',
            },
          },
          {
            $lookup: {
              from: 'orders',
              let: {
                id: '$_id',
              },
              pipeline: [
                {
                  $match: {
                    $and: [
                      {
                        $expr: {
                          $eq: ['$tableId', '$$id'],
                        },
                      },
                      {
                        status: OrderStatus.OnTable,
                      },
                    ],
                  },
                },
              ],
              as: 'onTableOrders',
            },
          },
          {
            $lookup: {
              from: 'tablelogs',
              let: {
                id: '$_id',
              },
              pipeline: [
                {
                  $match: {
                    $and: [
                      {
                        $expr: {
                          $eq: ['$tableId', '$$id'],
                        },
                      },
                      {
                        closingTime: null,
                      },
                    ],
                  },
                },
              ],
              as: 'tableLog',
            },
          },
          {
            $addFields: {
              newOrders: { $size: '$newOrders' },
              processingOrders: { $size: '$processingOrders' },
              onTableOrders: { $size: '$onTableOrders' },
            },
          },
        ],
        { allowDiskUse: true },
      ),
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );
  }

  async findOne(tableId: string): Promise<TableDocument> {
    const exists = await this.tableModel
      .findById(tableId)
      .populate([{ path: 'restaurantId', select: { name: 1, nameAr: 1 } }]);

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

  async logTable(tableId: string, start = true): Promise<TableLogDocument> {
    const table = await this.tableModel.findById(tableId);
    if (!table) {
      throw new NotFoundException();
    }

    let tableLog = await this.tableLogModel.findOne(
      { tableId },
      {},
      { sort: { _id: -1 } },
    );

    if (start) {
      if (tableLog && tableLog.closingTime == null) {
        throw new BadRequestException('Table is already started');
      }
      tableLog = new this.tableLogModel({
        supplierId: table.supplierId,
        restaurantId: table.restaurantId,
        tableId,
        startingTime: new Date(),
      });
    } else {
      if (!tableLog) {
        throw new BadRequestException('Table has not started yet');
      }

      tableLog.closingTime = new Date();
    }

    await tableLog.save();

    return tableLog;
  }

  async updateLog(
    tableId: string,
    dto: TableLogDto,
  ): Promise<TableLogDocument> {
    const tableLog = await this.tableLogModel.findOneAndUpdate(
      { tableId, closingTime: null },
      dto,
      {
        new: true,
      },
    );

    if (!tableLog) {
      throw new NotFoundException(`Table has not started yet`);
    }

    return tableLog;
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
