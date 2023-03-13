import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Table, TableDocument } from './schemas/table.schema';
import mongoose, { Model, PaginateModel, PaginateResult } from 'mongoose';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';

import { TableLog, TableLogDocument } from './schemas/table-log.schema';

import { TableLogDto } from './dto/table-log.dto';
import { TableStatus } from './enum/en.enum';
import { User, UserDocument } from 'src/users/schemas/users.schema';
import { TableService } from './table.service';
import { Order, OrderDocument } from 'src/order/schemas/order.schema';
import { OrderStatus, OrderPaymentStatus } from 'src/order/enum/en.enum';
import { SocketIoService } from 'src/socket-io/socket-io.service';
import { SocketIoGateway } from 'src/socket-io/socket-io.gateway';
import { SocketEvents } from 'src/socket-io/enum/events.enum';
import { Restaurant } from 'src/restaurant/schemas/restaurant.schema';

@Injectable()
export class TableLogService {
  constructor(
    @InjectModel(Table.name)
    private readonly tableModel: Model<TableDocument>,
    @InjectModel(TableLog.name)
    private readonly tableLogModelPag: PaginateModel<TableLogDocument>,
    @InjectModel(TableLog.name)
    private readonly tableLogModel: Model<TableLogDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private tableService: TableService,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    private socketGateway: SocketIoGateway,
  ) {}

  async current(tableId: string): Promise<TableLogDocument> {
    const exists = await this.tableLogModel.findOne(
      { tableId },
      {},
      { sort: { _id: -1 } },
    );

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async logs(
    req: any,
    tableId: string,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<TableLogDocument>> {
    const cashierLogs = await this.tableLogModelPag.paginate(
      {
        tableId,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );
    return cashierLogs;
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

      const user = await this.userModel.findOne({
        isDefaultWaiter: true,
        supplierId: table.supplierId,
        isBlocked: false,
      });
      tableLog = new this.tableLogModel({
        supplierId: table.supplierId,
        restaurantId: table.restaurantId,
        tableId,
        startingTime: new Date(),
        waiterId: user ? user._id : null,
      });
      this.tableService.update(tableId, {
        status: TableStatus.InUse,
        currentTableLog: tableLog._id,
      });
    } else {
      if (!tableLog) {
        throw new BadRequestException('Table has not started yet');
      }
      if (
        (await this.orderModel.count({
          paymentStatus: { $ne: OrderPaymentStatus.Paid },
          status: { $nin: [OrderStatus.Cancelled, OrderStatus.Closed] },
          tableId: tableLog.tableId,
        })) > 0
      ) {
        throw new BadRequestException('Some of the orders are not closed yet');
      }

      tableLog.closingTime = new Date();
      this.tableService.update(tableId, {
        status: TableStatus.Empty,
        currentTableLog: null,
      });
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

    this.socketGateway.emit(
      tableLog.supplierId.toString(),
      SocketEvents.TableLog,
      tableLog.toObject(),
    );

    return tableLog;
  }
}
