import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { LeanDocument, Model, PaginateModel, PaginateResult } from 'mongoose';

import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';

import { CashierLog, CashierLogDocument } from './schemas/cashier-log.schema';
import {
  CloseCashierDto,
  OpenCashierDto,
  OverrideCloseCashierDto,
} from './dto/cashier-log.dto';
import { PauseDto } from './dto/pause.dto';
import { CashierDocument } from './schemas/cashier.schema';
import { CashierService } from './cashier.service';
import { SocketIoGateway } from 'src/socket-io/socket-io.gateway';
import { TransactionDocument } from 'src/transaction/schemas/transactions.schema';
import { SocketEvents } from 'src/socket-io/enum/events.enum';

@Injectable()
export class CashierLogService {
  constructor(
    @InjectModel(CashierLog.name)
    private readonly cashierLogModel: Model<CashierLogDocument>,

    @InjectModel(CashierLog.name)
    private readonly cashierLogModelPag: PaginateModel<CashierLogDocument>,

    private readonly cashierService: CashierService,
    private socketGateway: SocketIoGateway,
  ) {}

  async current(cashierId: string): Promise<CashierLogDocument> {
    const exists = await this.cashierLogModel.findOne(
      { cashierId },
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
    cashierId: string,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<CashierLogDocument>> {
    const cashierLogs = await this.cashierLogModelPag.paginate(
      {
        cashierId,
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

  async start(req: any, dto: OpenCashierDto): Promise<CashierLogDocument> {
    let cashierId = null;
    if (req.user.cashierId) cashierId = req.user.cashierId;
    if (dto.cashierId) cashierId = dto.cashierId;

    if (!cashierId) throw new BadRequestException(`Cashier is not available`);
    console.log(cashierId);
    let cashierLog = await this.cashierLogModel.findOne(
      { cashierId },
      {},
      { sort: { _id: -1 } },
    );

    if (cashierLog && !cashierLog.closedAt) {
      throw new BadRequestException('Previous instance is not closed yet');
    }
    cashierLog = await this.cashierLogModel.create({
      ...dto,
      cashierId,
      currentBalance: dto.openingBalance,
      startedAt: new Date(),
      supplierId: req.user.supplierId,
      userId: req.user.userId,
    });
    this.cashierService.update(cashierId, { currentLog: cashierLog._id });
    return cashierLog;
  }

  async close(
    req: any,
    dto: CloseCashierDto | OverrideCloseCashierDto,
  ): Promise<CashierLogDocument> {
    let cashierId = null;
    if (req.user.cashierId) cashierId = req.user.cashierId;
    if (dto.cashierId) cashierId = dto.cashierId;

    if (!cashierId) throw new BadRequestException(`Cashier is not available`);
    const cashierLog = await this.cashierLogModel.findOne(
      { cashierId },
      {},
      { sort: { _id: -1 } },
    );

    if (cashierLog && cashierLog.closedAt) {
      throw new BadRequestException('No instance open to close');
    }
    const difference = dto.closingBalance - cashierLog.currentBalance;
    // validate balance
    if (!dto.overrideReason) {
      if (cashierLog.currentBalance != dto.closingBalance)
        throw new BadRequestException(
          `Closing balance is not matching the current balance. Difference is ${difference}`,
        );
    }

    cashierLog.set({ ...dto, closedAt: new Date(), difference });
    await cashierLog.save();
    this.cashierService.update(cashierId, { currentLog: null });
    return cashierLog;
  }

  async pause(
    cashierId: string,
    dto: PauseDto = null,
  ): Promise<CashierLogDocument> {
    const cashierLog = await this.cashierLogModel.findOne(
      { cashierId },
      {},
      { sort: { _id: -1 } },
    );
    if (!cashierLog) {
      throw new NotFoundException();
    }
    if (dto) {
      if (cashierLog.pausedLogs.length > 0) {
        const lastItem = cashierLog.pausedLogs.at(-1);
        if (!lastItem.end) {
          throw new BadRequestException('Instance is already paused');
        }
      }
      cashierLog.pausedLogs.push({ ...dto, start: new Date() });
    } else {
      if (cashierLog.pausedLogs.length == 0) {
        throw new BadRequestException('Nothing to resume');
      }
      const lastItem = cashierLog.pausedLogs.at(-1);
      if (lastItem.end) {
        throw new BadRequestException('Nothing to resume');
      }
      lastItem.end = new Date();
      cashierLog.pausedLogs[cashierLog.pausedLogs.length - 1] = lastItem;
    }
    await cashierLog.save();

    return cashierLog;
  }

  async logTransactionAsync(
    cashierId: string,
    transactionId: string,
  ): Promise<void> {
    const activeShift = await this.current(cashierId);
    await this.cashierLogModel.findOneAndUpdate(
      { _id: activeShift._id },
      { $push: { transactions: transactionId } },
    );
  }

  async storeCurrentBalance(
    cashierId,
    transaction: LeanDocument<TransactionDocument>,
  ) {
    const activeShift = await this.current(cashierId);
    await this.cashierLogModel.findOneAndUpdate(
      { _id: activeShift._id },
      {
        $inc: {
          currentBalance: transaction.isRefund
            ? -1 * transaction.amount
            : transaction.amount,
        },
      },
    );

    this.socketGateway.emit(
      transaction.supplierId.toString(),
      SocketEvents.Cashier,
      { cashierId: transaction.cashierId, refresh: true },
    );
  }

  async autoStartCashier(req, cashier: CashierDocument) {
    const cashierLog = await this.cashierLogModel.create({
      cashierId: cashier._id,
      openingBalance: 0,
      currentBalance: 0,
      startedAt: new Date(),
      supplierId: cashier.supplierId,
      userId: req ? req.user.userId : null,
    });
    this.cashierService.update(cashier._id, { currentLog: cashierLog._id });
  }
}
