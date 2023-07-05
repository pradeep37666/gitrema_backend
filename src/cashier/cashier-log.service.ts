import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
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
import { CashierHelperService } from './cashier-helper.service';
import { VALIDATION_MESSAGES } from 'src/core/Constants/validation-message';

@Injectable()
export class CashierLogService {
  constructor(
    @InjectModel(CashierLog.name)
    private readonly cashierLogModel: Model<CashierLogDocument>,

    @InjectModel(CashierLog.name)
    private readonly cashierLogModelPag: PaginateModel<CashierLogDocument>,

    @Inject(forwardRef(() => CashierService))
    private readonly cashierService: CashierService,
    @Inject(forwardRef(() => CashierHelperService))
    private readonly cashierHelperService: CashierHelperService,
    private socketGateway: SocketIoGateway,
  ) {}

  async current(cashierId: string): Promise<any> {
    const exists = await this.cashierLogModel
      .findOne({ cashierId }, {}, { sort: { _id: -1 } })
      .populate([
        {
          path: 'transactions',
          populate: [
            {
              path: 'orderId',
              select: { items: 0 },
            },
          ],
        },
        {
          path: 'userId',
          select: {
            name: 1,
            _id: 1,
            phoneNumber: 1,
            email: 1,
            whatsappNumber: 1,
          },
        },
      ]);

    if (!exists) {
      throw new NotFoundException();
    }

    return {
      ...exists.toObject(),
      dashboard: this.cashierHelperService.prepareDashboardData(exists),
    };
  }

  async singleLog(cashierId: string, cashierLogId: string): Promise<any> {
    const exists = await this.cashierLogModel
      .findOne({ cashierId, _id: cashierLogId })
      .populate([
        {
          path: 'transactions',
          populate: [
            {
              path: 'orderId',
              select: {
                items: 0,
              },
            },
          ],
        },
        {
          path: 'userId',
          select: {
            name: 1,
            _id: 1,
            phoneNumber: 1,
            email: 1,
            whatsappNumber: 1,
          },
        },
      ]);

    if (!exists) {
      throw new NotFoundException();
    }

    return {
      ...exists.toObject(),
      dashboard: this.cashierHelperService.prepareDashboardData(exists),
    };
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
        populate: [
          {
            path: 'transactions',
          },
          {
            path: 'userId',
            select: {
              name: 1,
              _id: 1,
              phoneNumber: 1,
              email: 1,
              whatsappNumber: 1,
            },
          },
        ],
        allowDiskUse: true,
      },
    );
    cashierLogs.docs.forEach((cashierLog: any) => {
      cashierLog.dashboard =
        this.cashierHelperService.prepareDashboardData(cashierLog);
    });
    return cashierLogs;
  }

  async start(req: any, dto: OpenCashierDto): Promise<CashierLogDocument> {
    let cashierId = null;
    if (dto.cashierId) cashierId = dto.cashierId;

    if (!cashierId) {
      // identify cashierId
      cashierId = await this.cashierHelperService.resolveCashierId(
        req,
        cashierId,
      );
    }
    console.log(cashierId);
    let cashierLog = await this.cashierLogModel.findOne(
      { cashierId },
      {},
      { sort: { _id: -1 } },
    );

    if (cashierLog && !cashierLog.closedAt) {
      throw new BadRequestException(
        VALIDATION_MESSAGES.PreviousOpenInstance.key,
      );
    }
    const imageNoteDto: any = {};
    if (dto.image) {
      imageNoteDto.images = [dto.image];
    }
    if (dto.note) {
      imageNoteDto.notes = [dto.note];
    }
    console.log(imageNoteDto);
    cashierLog = await this.cashierLogModel.create({
      ...dto,
      ...imageNoteDto,
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

    if (dto.cashierId) cashierId = dto.cashierId;

    if (!cashierId) {
      // identify cashierId
      cashierId = await this.cashierHelperService.resolveCashierId(
        req,
        cashierId,
      );
    }
    const cashierLog = await this.cashierLogModel.findOne(
      { cashierId },
      {},
      { sort: { _id: -1 } },
    );

    if (cashierLog && cashierLog.closedAt) {
      throw new BadRequestException(VALIDATION_MESSAGES.NoOpenInstance.key);
    }
    const difference = dto.closingBalance - cashierLog.currentBalance;
    // validate balance
    if (!dto.overrideReason) {
      if (cashierLog.currentBalance != dto.closingBalance)
        throw new BadRequestException(
          `${VALIDATION_MESSAGES.NoBalanceMatch.key} ${difference}`,
        );
    }

    if (dto.image) {
      cashierLog.images.push(dto.image);
    }
    if (dto.note) {
      cashierLog.notes.push(dto.note);
    }

    cashierLog.set({
      ...dto,
      closedAt: new Date(),
      difference,
    });
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
          throw new BadRequestException(VALIDATION_MESSAGES.AlreadyPaused.key);
        }
      }
      cashierLog.pausedLogs.push({ ...dto, start: new Date() });
    } else {
      if (cashierLog.pausedLogs.length == 0) {
        throw new BadRequestException(VALIDATION_MESSAGES.NothingToResume.key);
      }
      const lastItem = cashierLog.pausedLogs.at(-1);
      if (lastItem.end) {
        throw new BadRequestException(VALIDATION_MESSAGES.NothingToResume.key);
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
