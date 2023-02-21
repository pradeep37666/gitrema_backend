import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { DefaultSort, PaginationDto, pagination } from 'src/core/Constants/pagination';
import { CashierLog, CashierLogDocument } from './schemas/cashier-log.schema';
import { CloseCashierDto, OpenCashierDto } from './dto/cashier-log.dto';
import { PauseDto } from './dto/pause.dto';
import { Cashier, CashierDocument } from './schemas/cashier.schema';
import { Transaction, TransactionDocument } from 'src/transaction/schemas/transactions.schema';
import { PaymentMethod } from 'src/payment/enum/en.enum';

@Injectable()
export class CashierLogService {
  constructor(
    @InjectModel(CashierLog.name)
    private readonly cashierLogModel: Model<CashierLogDocument>,

    @InjectModel(CashierLog.name)
    private readonly cashierLogModelPag: PaginateModel<CashierLogDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(Cashier.name)
    private readonly cashierModel: Model<CashierDocument>,
  ) {}

  async current(cashierId: string): Promise<CashierLogDocument> {
    const exists = await this.cashierLogModel.findOne(
      { cashierId, closedAt: null },
      {},
      { sort: { _id: -1 } },
    );

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async findDashboard(cashierId: string): Promise<any> {
    if (!(await this.cashierModel.findById(cashierId))) throw new NotFoundException();

    const activeShift = await this.current(cashierId);
    const transactions = await this.transactionModel
      .find({
        cashierId: cashierId,
        createdAt: { $gte: activeShift.startedAt },
      })
      .lean();

    const refunds = transactions.filter(t => t.isRefund);
    const sales = transactions.filter(t => !t.isRefund);
    const cashSales = sales.filter(s => s.paymentMethod === PaymentMethod.Cash);
    const bankSales = sales.filter(s => s.paymentMethod === PaymentMethod.Online);

    const dashboard = {
      openingBalance: activeShift.openingBalance,
      totalRefunds: this.foldAmount(refunds),
      totalSales: this.foldAmount(sales),
      totalInCash: this.foldAmount(cashSales),
      totalInBank: this.foldAmount(bankSales),
    }
    return dashboard;
  }

  private foldAmount(records: any[]): number {
    return records.reduce((prev, acc) => prev + acc.amount, 0)
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
    const cashierLog = await this.cashierLogModel.findOne(
      { cashierId: dto.cashierId },
      {},
      { sort: { _id: -1 } },
    );

    if (cashierLog && !cashierLog.closedAt) {
      throw new BadRequestException('Previous instance is not closed yet');
    }
    return await this.cashierLogModel.create({
      ...dto,
      startedAt: new Date(),
      supplierId: req.user.supplierId,
    });
  }

  async close(
    req: any,
    dto: CloseCashierDto,
  ): Promise<CashierLogDocument> {
    const cashierLog = await this.cashierLogModel.findOne(
      { cashierId: dto.cashierId },
      {},
      { sort: { _id: -1 } },
    );

    if (cashierLog && cashierLog.closedAt) {
      throw new BadRequestException('No instance open to close');
    }
    // validate balance
    const { totalInCash } = await this.findDashboard(dto.cashierId);
    const difference = dto.closingBalance - totalInCash;
    cashierLog.set({ ...dto, closedAt: new Date(), difference });
    await cashierLog.save();
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
}
