import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  StreamableFile,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import mongoose, {
  LeanDocument,
  Model,
  PaginateModel,
  PaginateResult,
} from 'mongoose';

import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';

import { CashierLog, CashierLogDocument } from './schemas/cashier-log.schema';
import {
  CloseCashierDto,
  ExpenseDto,
  OpenCashierDto,
  OverrideCloseCashierDto,
} from './dto/cashier-log.dto';
import { PauseDto } from './dto/pause.dto';
import { CashierDocument } from './schemas/cashier.schema';
import { CashierService } from './cashier.service';
import { SocketIoGateway } from 'src/socket-io/socket-io.gateway';
import {
  Transaction,
  TransactionDocument,
} from 'src/transaction/schemas/transactions.schema';
import { SocketEvents } from 'src/socket-io/enum/events.enum';
import { CashierHelperService } from './cashier-helper.service';
import { VALIDATION_MESSAGES } from 'src/core/Constants/validation-message';
import { CashierReportDto } from './dto/cashier-report.dto';
import { TIMEZONE } from 'src/core/Constants/system.constant';
import {
  Supplier,
  SupplierDocument,
} from 'src/supplier/schemas/suppliers.schema';
import { Invoice, InvoiceDocument } from 'src/invoice/schemas/invoice.schema';
import { convertUtcToSupplierTimezone } from 'src/core/Helpers/universal.helper';
import * as moment from 'moment';
import { OrderStatus } from 'src/order/enum/en.enum';
import { PaymentStatus } from 'src/core/Constants/enum';
import { roundOffNumber } from '../core/Helpers/universal.helper';
import { Workbook } from 'exceljs';
import * as tmp from 'tmp';
import * as fs from 'fs';
import { Type } from 'class-transformer';
import ObjectId from 'mongoose';
import { PaymentMethod } from 'src/payment/enum/en.enum';
import { User, UserDocument } from 'src/users/schemas/users.schema';
import {
  DeferredTransaction,
  DeferredTransactionDocument,
} from 'src/order/schemas/deferred-transaction.schema';

@Injectable()
export class CashierLogService {
  constructor(
    @InjectModel(CashierLog.name)
    private readonly cashierLogModel: Model<CashierLogDocument>,

    @InjectModel(CashierLog.name)
    private readonly cashierLogModelPag: PaginateModel<CashierLogDocument>,
    @InjectModel(Supplier.name)
    private readonly supplierModel: Model<SupplierDocument>,

    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @Inject(forwardRef(() => CashierService))
    private readonly cashierService: CashierService,
    @Inject(forwardRef(() => CashierHelperService))
    private readonly cashierHelperService: CashierHelperService,
    @InjectModel(DeferredTransaction.name)
    private readonly deferredTransactionModel: Model<DeferredTransactionDocument>,
    private socketGateway: SocketIoGateway,
  ) {}

  async findCurrentLog(cashierId: string): Promise<CashierLogDocument> {
    const exists = await this.cashierLogModel.findOne(
      { cashierId },
      {},
      { sort: { _id: -1 } },
    );
    return exists;
  }
  async current(cashierId: string): Promise<any> {
    const exists = await this.findCurrentLog(cashierId);
    if (!exists) {
      throw new NotFoundException();
    }
    await exists.populate([
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

    return {
      ...exists.toObject(),
      dashboard: await this.cashierHelperService.prepareDashboardData(exists),
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
      dashboard: await this.cashierHelperService.prepareDashboardData(exists),
    };
  }

  async logs(
    req: any,
    cashierId: string,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<CashierLogDocument>> {
    const cashierLogs: any = await this.cashierLogModelPag.paginate(
      {
        cashierId,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
        populate: [
          // {
          //   path: 'transactions',
          //   populate: [
          //     {
          //       path: 'orderId',
          //       select: { orderNumber: 1 },
          //     },
          //   ],
          // },
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
    // for (const i in cashierLogs.docs) {
    //   cashierLogs.docs[i].dashboard =
    //     await this.cashierHelperService.prepareDashboardData(
    //       cashierLogs.docs[i],
    //     );
    // }

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

  async storeExpense(req, cashierId: string, dto: ExpenseDto) {
    const log = await this.findCurrentLog(cashierId);
    log.expenses.push({ ...dto, addedBy: req.user.userId });
    await log.save();
    return log;
  }

  async removeExpense(req, cashierId: string, expenseId: string) {
    const log = await this.findCurrentLog(cashierId);
    log.expenses = log.expenses.filter(
      (e: any) => e._id.toString() != expenseId,
    );
    await log.save();
    return log;
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

  async orderReport(req, query: CashierReportDto, isFile = false) {
    const supplier = await this.supplierModel.findById(req.user.supplierId);
    const timezone = supplier?.timezone ?? TIMEZONE;
    let queryToApply: any = {};
    if (query.startDate && query.endDate) {
      query.startDate.setUTCHours(query.startDate.getHours());
      query.startDate.setUTCMinutes(query.startDate.getMinutes());
      query.startDate = new Date(
        query.startDate.toLocaleString('en', { timeZone: timezone }),
      );
      query.endDate.setUTCHours(query.endDate.getHours());
      query.endDate.setUTCMinutes(query.endDate.getMinutes());
      query.endDate = new Date(
        query.endDate.toLocaleString('en', { timeZone: timezone }),
      );
    }
    if (query.restaurantId) {
      queryToApply.restaurantId = query.restaurantId;
    }
    console.log({
      createdAt: {
        $gte: query.startDate,
        $lte: query.endDate,
      },
    });
    const cashierLogs: any = await this.cashierLogModel
      .find({
        supplierId: req.user.supplierId,
        ...queryToApply,
      })
      .populate([
        {
          path: 'transactions',
          match: {
            createdAt: {
              $gte: query.startDate,
              $lte: query.endDate,
            },
            status: PaymentStatus.Success,
          },
          populate: [
            {
              path: 'orderId',
            },
            {
              path: 'addedBy',
            },
          ],
        },
        {
          path: 'userId',
        },
      ]);

    const deferredTransactions = await this.deferredTransactionModel
      .find({
        supplierId: req.user.supplierId,
        ...queryToApply,
      })
      .populate([
        {
          path: 'addedBy',
        },
      ]);

    const response: any = [],
      records: any = [
        [
          'Order Number',
          'Invoice Number',
          'Date',
          'Time',
          'Paid Amount',
          'Payment Method',
          'Invoice Links',
          'User Names',
          'Cashier Log (Shift)',
        ],
        [
          'رقم الطلب',
          'رقم الفاتورة',
          'التاريخ',
          'الوقت',
          'المبلغ المدفوع',
          'طريقة الدفع',
          'الفاتورة',
          'اسم الموظف',
          'الشفت',
        ],
      ];
    const book = new Workbook();
    const sheet = book.addWorksheet('Transactions');
    let cash = 0,
      card = 0,
      online = 0,
      deferred = 0,
      refund = 0,
      expense = 0;
    for (const i in cashierLogs) {
      for (const j in cashierLogs[i].transactions) {
        const order = response.find(
          (o) => o.orderNumber == cashierLogs[i].transactions[j].orderNumber,
        );
        if (
          !order &&
          cashierLogs[i].transactions[j].status == PaymentStatus.Success
        ) {
          const invoices = await this.invoiceModel.find(
            {
              orderId: cashierLogs[i].transactions[j].orderId._id,
            },
            {},
            { sort: { _id: -1 } },
          );
          const date = convertUtcToSupplierTimezone(
            cashierLogs[i].transactions[j].createdAt,
            timezone,
          );
          const row = {
            orderNumber: cashierLogs[i].transactions[j].orderId.orderNumber,
            invoiceNumber: invoices.length > 0 ? invoices[0].invoiceNumber : '',
            date: moment(date).format('DD/MM/YYYY'),
            time: moment(date).format('hh:mm A'),
            totalPaid: roundOffNumber(
              cashierLogs[i].transactions[j].amount *
                cashierLogs[i].transactions[j].isRefund
                ? -1
                : 1,
            ),
            paymentMethod: cashierLogs[i].transactions[j].paymentMethod,
            invoiceLinks: invoices.map((i) => i.imageUrl).join(','),
            user: cashierLogs[i]?.transactions[j]?.addedBy?.name ?? 'N/A',

            shift: moment
              .utc(cashierLogs[i].startedAt)
              .tz(timezone)
              .format('DD/MM/yyyy hh:mm a'),
          };
          response.push(row);
          if (isFile) {
            records.push(Object.values(row));
          }
          if (cashierLogs[i].transactions[j].isRefund) {
            refund += cashierLogs[i].transactions[j].amount;
          } else if (
            cashierLogs[i].transactions[j].paymentMethod == PaymentMethod.Card
          ) {
            card += cashierLogs[i].transactions[j].amount;
          } else if (
            cashierLogs[i].transactions[j].paymentMethod == PaymentMethod.Cash
          ) {
            cash += cashierLogs[i].transactions[j].amount;
          } else if (
            cashierLogs[i].transactions[j].paymentMethod == PaymentMethod.Online
          ) {
            online += cashierLogs[i].transactions[j].amount;
          }
        }
      }
      for (const j in cashierLogs[i].expenses) {
        const date = convertUtcToSupplierTimezone(
          cashierLogs[i].expenses[j].createdAt,
          timezone,
        );
        const row = {
          orderNumber: '',
          invoiceNumber: '',
          date: moment(date).format('DD/MM/YYYY'),
          time: moment(date).format('hh:mm A'),
          totalPaid: roundOffNumber(cashierLogs[i].expenses[j].expense * -1),
          paymentMethod: 'Expense',
          invoiceLinks: '',
          user: cashierLogs[i]?.expenses[j]?.addedBy?.name ?? 'N/A',

          shift: moment
            .utc(cashierLogs[i].startedAt)
            .tz(timezone)
            .format('DD/MM/yyyy hh:mm a'),
        };
        response.push(row);
        if (isFile) {
          records.push(Object.values(row));
        }
        expense += cashierLogs[i].expenses[j].expense;
      }
    }
    for (const i in deferredTransactions) {
      const date = convertUtcToSupplierTimezone(
        deferredTransactions[i].createdAt,
        timezone,
      );
      const row = {
        orderNumber: '',
        invoiceNumber: '',
        date: moment(date).format('DD/MM/YYYY'),
        time: moment(date).format('hh:mm A'),
        totalPaid: roundOffNumber(deferredTransactions[i].amount),
        paymentMethod: 'Deferred',
        invoiceLinks: '',
        user: deferredTransactions[i]?.addedBy?.name ?? 'N/A',

        shift: moment(date).format('DD/MM/yyyy hh:mm a'),
      };
      response.push(row);
      if (isFile) {
        records.push(Object.values(row));
      }
      deferred += deferredTransactions[i].amount;
    }
    response.push(
      {
        summaryLabel: 'Cash',
        value: cash,
      },
      {
        summaryLabel: 'Card',
        value: card,
      },
      {
        summaryLabel: 'Online',
        value: online,
      },
      {
        summaryLabel: 'Deferred',
        value: deferred,
      },
      {
        summaryLabel: 'Refunded',
        value: refund,
      },
      {
        summaryLabel: 'Expense',
        value: expense,
      },
    );
    records.push(
      ['Cash', cash],
      ['Card', card],
      ['Online', online],
      ['Deferred', deferred],
      ['Refunded', refund],
      ['Expense', expense],
    );

    if (!isFile) return response;
    sheet.addRows(records);
    const tmpFile = tmp.fileSync({
      mode: 0o644,
    });
    await book.xlsx.writeFile(tmpFile.name);
    const file = fs.createReadStream(tmpFile.name);
    return new StreamableFile(file);
  }

  async cashierReport(req, query: CashierReportDto, isFile = false) {
    const supplier = await this.supplierModel.findById(req.user.supplierId);
    const timezone = supplier?.timezone ?? TIMEZONE;
    let queryToApply: any = {};
    let createdAtQuery: any = {};
    if (query.startDate && query.endDate) {
      query.startDate.setUTCHours(query.startDate.getHours());
      query.startDate.setUTCMinutes(query.startDate.getMinutes());
      query.startDate = new Date(
        query.startDate.toLocaleString('en', { timeZone: timezone }),
      );
      query.endDate.setUTCHours(query.endDate.getHours());
      query.endDate.setUTCMinutes(query.endDate.getMinutes());
      query.endDate = new Date(
        query.endDate.toLocaleString('en', { timeZone: timezone }),
      );
      createdAtQuery = {
        createdAt: {
          $gte: query.startDate,
          $lte: query.endDate,
        },
      };
    }
    if (query.restaurantId) {
      queryToApply.restaurantId = new mongoose.Types.ObjectId(
        query.restaurantId,
      );
    }

    const cashierLogs: any = await this.cashierLogModel.aggregate([
      {
        $match: {
          supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
          ...queryToApply,
        },
      },
      {
        $lookup: {
          from: 'transactions',
          let: { transactions: '$transactions' },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $in: ['$_id', '$$transactions'],
                    },
                    status: PaymentStatus.Success,
                    ...createdAtQuery,
                  },
                ],
              },
            },
          ],

          as: 'transactions',
        },
      },
      {
        $match: {
          transactions: { $ne: [] },
        },
      },

      {
        $unwind: '$transactions',
      },

      {
        $group: {
          _id: {
            userId: '$transactions.addedBy',
            paymentMethod: '$transactions.paymentMethod',
            startedAt: '$startedAt',
            closedAt: '$closedAt',
          },
          //totalExpenses: { $sum: '$expenses.amount' },
          sales: {
            $sum: '$transactions.amount',
          },
        },
      },
    ]);

    const expenses: any = await this.cashierLogModel.aggregate([
      {
        $match: {
          supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
          ...queryToApply,
          expenses: { $exists: true, $not: { $size: 0 }, $ne: null },
        },
      },

      {
        $unwind: '$expenses',
      },

      {
        $group: {
          _id: {
            userId: '$expenses.addedBy',
            startedAt: '$startedAt',
            closedAt: '$closedAt',
          },

          expense: {
            $sum: '$expenses.amount',
          },
        },
      },
    ]);

    const deferredTransactions = await this.deferredTransactionModel.aggregate([
      {
        $match: {
          supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
          ...queryToApply,
        },
      },
      {
        $addFields: {
          y: { $year: { date: '$createdAt', timezone } },
          m: { $month: { date: '$createdAt', timezone } },
          d: { $dayOfMonth: { date: '$createdAt', timezone } },
        },
      },
      {
        $group: {
          _id: {
            userId: '$addedBy',
            year: '$y',
            month: '$m',
            day: '$d',
          },

          amount: {
            $sum: '$amount',
          },
        },
      },
    ]);
    console.log(cashierLogs, expenses);
    const book = new Workbook();
    const sheet = book.addWorksheet('Transactions');
    const response = [],
      records = [
        [
          'User Names',
          'Cash Sales',
          'Card Sales',
          'Total Expenses',
          'Net Cash',
          'Shift',
        ],
        [
          'اسم الموظف',
          'مبيعات كاش',
          'مبيعات شبكة',
          'مصروفات',
          'صافي الكاش',
          'الشفت',
        ],
      ];
    let users = await this.userModel.find(
      {
        _id: { $in: cashierLogs.map((c) => c._id?.userId) },
      },
      { name: 1, _id: 1 },
    );
    users = users.reduce((acc, d) => {
      acc[d._id.toString()] = d;
      return acc;
    }, []);
    const cashierRecords = [];
    cashierLogs.forEach((element) => {
      if (
        !cashierRecords[
          `${element?._id?.userId?.toString()}_${element?._id?.startedAt}_${
            element?._id?.closedAt
          }`
        ]
      ) {
        cashierRecords[
          `${element?._id?.userId?.toString()}_${element?._id?.startedAt}_${
            element?._id?.closedAt
          }`
        ] = {
          _id: element._id,
        };
      }

      if (element?._id?.paymentMethod == PaymentMethod.Card) {
        cashierRecords[
          `${element?._id?.userId?.toString()}_${element?._id?.startedAt}_${
            element?._id?.closedAt
          }`
        ].cardSales = element.sales;
      } else if (element?._id?.paymentMethod == PaymentMethod.Cash) {
        cashierRecords[
          `${element?._id?.userId?.toString()}_${element?._id?.startedAt}_${
            element?._id?.closedAt
          }`
        ].cashSales = element.sales;
      }
    });
    expenses.forEach((element) => {
      if (element.expense > 0) {
        if (
          !cashierRecords[
            `${element?._id?.userId?.toString()}_${element?._id?.startedAt}_${
              element?._id?.closedAt
            }`
          ]
        ) {
          cashierRecords[
            `${element?._id?.userId?.toString()}_${element?._id?.startedAt}_${
              element?._id?.closedAt
            }`
          ] = {
            _id: element._id,
          };
        }
        cashierRecords[
          `${element?._id?.userId?.toString()}_${element?._id?.startedAt}_${
            element?._id?.closedAt
          }`
        ].expense = element.expense;
      }
    });

    deferredTransactions.forEach((element) => {
      const index = cashierRecords.findIndex((o) => {
        if (o._id.userId.toString() == element._id.userId.toString()) {
          const date = moment(
            `${element.year}-${element.month}-${element.day}`,
          );
          const startedAt = moment(o._id.startedAt);
          const closedAt = o._id.closedAt ? moment(o._id.closedAt) : null;

          if (closedAt) {
            return date.isBetween(startedAt, closedAt);
          } else {
            return date.isSameOrBefore(startedAt);
          }
        }
      });
      if (index == -1) {
        cashierRecords[
          `${element?._id?.userId?.toString()}_${element?._id?.year}_${
            element?._id?.month
          }_${element?._id?.day}`
        ] = {
          _id: {
            userId: element._id.userId,
            startedAt: `${element.year}-${element.month}-${element.day}`,
            closedAt: `${element.year}-${element.month}-${element.day}`,
          },
          deferred: element.amount,
        };
      } else {
        cashierRecords[index].deferred += element.amount;
      }
      if (element.expense > 0) {
        if (
          !cashierRecords[
            `${element?._id?.userId?.toString()}_${element?._id?.startedAt}_${
              element?._id?.closedAt
            }`
          ]
        ) {
          cashierRecords[
            `${element?._id?.userId?.toString()}_${element?._id?.startedAt}_${
              element?._id?.closedAt
            }`
          ] = {
            _id: element._id,
          };
        }
        cashierRecords[
          `${element?._id?.userId?.toString()}_${element?._id?.startedAt}_${
            element?._id?.closedAt
          }`
        ].expense = element.expense;
      }
    });

    for (const i in cashierRecords) {
      const row: any = {
        username:
          users[cashierRecords[i]?._id?.userId?.toString()]?.name ?? 'N/A',
        cashSales: roundOffNumber(cashierRecords[i].cashSales ?? 0),
        cardSales: roundOffNumber(cashierRecords[i].cardSales ?? 0),
        totalExpenses: roundOffNumber(cashierRecords[i].expense ?? 0),
        netCash: roundOffNumber(
          (cashierRecords[i].cashSales ?? 0) - (cashierRecords[i].expense ?? 0),
        ),
        deferred: roundOffNumber(cashierRecords[i].deferred ?? 0),
        shift: moment
          .utc(cashierRecords[i]._id.startedAt)
          .tz(timezone)
          .format('DD/MM/yyyy hh:mm a'),
      };

      if (isFile) {
        records.push(Object.values(row));
      } else {
        response.push(row);
      }
    }

    if (!isFile) return response;
    sheet.addRows(records);
    const tmpFile = tmp.fileSync({
      mode: 0o644,
    });
    await book.xlsx.writeFile(tmpFile.name);
    const file = fs.createReadStream(tmpFile.name);
    return new StreamableFile(file);
  }
}
