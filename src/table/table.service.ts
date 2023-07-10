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
import { QuerySingleTableDto, QueryTableDto } from './dto/query-table.dto';
import { TableLog, TableLogDocument } from './schemas/table-log.schema';
import {
  OrderPaymentStatus,
  OrderStatus,
  PreparationStatus,
} from 'src/order/enum/en.enum';
import { TableLogDto } from './dto/table-log.dto';
import { TableStatus } from './enum/en.enum';
import { User, UserDocument } from 'src/users/schemas/users.schema';
import { match } from 'assert';

@Injectable()
export class TableService {
  constructor(
    @InjectModel(Table.name)
    private readonly tableModel: Model<TableDocument>,
    @InjectModel(Table.name)
    private readonly tableModelPag: AggregatePaginateModel<TableDocument>,
    @InjectModel(TableLog.name)
    private readonly tableLogModel: Model<TableLogDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
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
              from: 'tablelogs',
              localField: 'currentTableLog',
              foreignField: '_id',
              as: 'currentTableLog',
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'currentTableLog.waiterId',
              foreignField: '_id',
              as: 'waiter',
            },
          },
          {
            $addFields: {
              currentTableLog: {
                $cond: {
                  if: { $eq: [{ $size: '$currentTableLog' }, 1] },
                  then: { $arrayElemAt: ['$currentTableLog', 0] },
                  else: null,
                },
              },
              waiter: {
                $cond: {
                  if: { $eq: [{ $size: '$waiter' }, 1] },
                  then: { $arrayElemAt: ['$waiter', 0] },
                  else: null,
                },
              },
            },
          },
          {
            $addFields: {
              'currentTableLog.waiterName': '$waiter.name',
            },
          },
          {
            $lookup: {
              from: 'orders',
              localField: 'currentTableLog.orders',
              foreignField: '_id',
              as: 'orders',
            },
          },
          {
            $addFields: {
              orderItems: {
                $map: {
                  input: '$orders',
                  as: 'order',
                  in: {
                    items: {
                      $size: {
                        $filter: {
                          input: '$$order.items',
                          as: 'item',
                          cond: {
                            $eq: [
                              '$$item.preparationStatus',
                              PreparationStatus.DonePreparing,
                            ],
                          },
                        },
                      },
                    },
                  },
                },
              },
              servedOrderItems: {
                $map: {
                  input: '$orders',
                  as: 'order',
                  in: {
                    items: {
                      $size: {
                        $filter: {
                          input: '$$order.items',
                          as: 'item',
                          cond: {
                            $eq: [
                              '$$item.preparationStatus',
                              PreparationStatus.OnTable,
                            ],
                          },
                        },
                      },
                    },
                  },
                },
              },
              pendingOrderItems: {
                $map: {
                  input: '$orders',
                  as: 'order',
                  in: {
                    items: {
                      $size: {
                        $filter: {
                          input: '$$order.items',
                          as: 'item',
                          cond: {
                            $in: [
                              '$$item.preparationStatus',
                              [
                                PreparationStatus.NotStarted,
                                PreparationStatus.StartedPreparing,
                              ],
                            ],
                          },
                        },
                      },
                    },
                  },
                },
              },
              newOrders: {
                $size: {
                  $filter: {
                    input: '$orders',
                    cond: { $eq: ['$$this.status', OrderStatus.New] },
                  },
                },
              },
              processingOrders: {
                $size: {
                  $filter: {
                    input: '$orders',
                    cond: {
                      $in: [
                        '$$this.status',
                        [
                          OrderStatus.SentToKitchen,
                          OrderStatus.StartedPreparing,
                          OrderStatus.DonePreparing,
                        ],
                      ],
                    },
                  },
                },
              },

              activeOrders: {
                $filter: {
                  input: '$orders',
                  cond: {
                    $in: [
                      '$$this.status',
                      [
                        OrderStatus.New,
                        OrderStatus.SentToKitchen,
                        OrderStatus.StartedPreparing,
                        OrderStatus.DonePreparing,
                        OrderStatus.OnTable,
                        OrderStatus.Closed,
                      ],
                    ],
                  },
                },
              },

              onTableOrders: {
                $size: {
                  $filter: {
                    input: '$orders',
                    cond: { $eq: ['$$this.status', OrderStatus.OnTable] },
                  },
                },
              },
            },
          },
          {
            $addFields: {
              totalPaid: { $sum: '$activeOrders.summary.totalPaid' },
              total: { $sum: '$activeOrders.summary.totalWithTax' },
              remianingAmount: {
                $sum: '$activeOrders.summary.remainingAmountToCollect',
              },
              itemsReadyToPickup: { $sum: '$orderItems.items' },
              itemsServed: { $sum: '$servedOrderItems.items' },
              itemsPending: { $sum: '$pendingOrderItems.items' },
            },
          },
          {
            $project: {
              orders: 0,
              orderItems: 0,
              servedOrderItems: 0,
              pendingOrderItems: 0,
              waiter: 0,
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

  async findOne(
    tableId: string,
    query: QuerySingleTableDto,
  ): Promise<TableDocument> {
    let orderQuery: any = {};
    if (query.paymentStatus) {
      orderQuery.paymentStatus = { $in: query.paymentStatus };
    }
    if (query.status) {
      orderQuery.status = { $in: query.status };
    }
    const exists = await this.tableModel.findById(tableId).populate([
      { path: 'restaurantId', select: { name: 1, nameAr: 1 } },
      {
        path: 'currentTableLog',
        populate: [{ path: 'orders', match: { ...orderQuery } }],
      },
    ]);

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async update(
    tableId: string,
    dto: UpdateTableDto | any,
  ): Promise<TableDocument> {
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
