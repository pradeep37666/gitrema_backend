import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { Cashier, CashierDocument } from './schemas/cashier.schema';
import { CashierLogService } from './cashier-log.service';
import { User, UserDocument } from 'src/users/schemas/users.schema';
import { VALIDATION_MESSAGES } from 'src/core/Constants/validation-message';
import { PaymentMethod } from 'src/payment/enum/en.enum';
import { CashierLogDocument } from './schemas/cashier-log.schema';
import { roundOffNumber } from '../core/Helpers/universal.helper';
import {
  DeferredTransaction,
  DeferredTransactionDocument,
} from 'src/order/schemas/deferred-transaction.schema';

@Injectable()
export class CashierHelperService {
  constructor(
    @InjectModel(Cashier.name)
    private readonly cashierModel: Model<CashierDocument>,
    @Inject(forwardRef(() => CashierLogService))
    private readonly cashierLogService: CashierLogService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(DeferredTransaction.name)
    private readonly deferredTransactionModel: Model<DeferredTransactionDocument>,
  ) {}

  async postCashierCreate(req, cashier: CashierDocument) {
    this.keepOnlyOneDefault(cashier);
  }

  async postCashierUpdate(cashier: CashierDocument, dto) {
    if (dto.default == true) this.keepOnlyOneDefault(cashier);
  }

  async keepOnlyOneDefault(cashier) {
    if (cashier.default == true) {
      await this.cashierModel.updateMany(
        {
          restaurantId: cashier.restaurantId,
          _id: { $ne: cashier._id },
        },
        {
          $set: {
            default: false,
          },
        },
      );
    }
  }

  foldAmount(records: any[]): number {
    return records.reduce((prev, acc) => prev + acc.amount, 0);
  }

  async prepareDashboardData(cashierLog: CashierLogDocument) {
    const deferredTransactions = await this.deferredTransactionModel.find({
      cashierId: cashierLog.cashierId,
      createdAt: {
        $gte: cashierLog.startedAt,
        $lte: cashierLog.closedAt ?? new Date(),
      },
    });
    const transactions = cashierLog.transactions;
    const refunds = transactions.filter((t) => t.isRefund);
    const sales = transactions.filter((t) => !t.isRefund);
    const cashSales = sales.filter(
      (s) => s.paymentMethod === PaymentMethod.Cash,
    );
    const bankSales = sales.filter(
      (s) =>
        s.paymentMethod === PaymentMethod.Online ||
        s.paymentMethod === PaymentMethod.Card,
    );
    const expense = cashierLog.expenses.reduce(
      (prev, acc) => prev + acc.expense,
      0,
    );
    const dashboard = {
      openingBalance: roundOffNumber(cashierLog.openingBalance),
      totalRefunds: roundOffNumber(this.foldAmount(refunds)),
      totalSales: roundOffNumber(this.foldAmount(sales)),
      salesPaidWithCash: roundOffNumber(this.foldAmount(cashSales)),
      salesPaidWithCard: roundOffNumber(this.foldAmount(bankSales)),
      expectedCashAtClose: roundOffNumber(
        cashierLog.openingBalance +
          this.foldAmount(cashSales) -
          this.foldAmount(refunds) -
          expense,
      ),
      deferredAmount: roundOffNumber(this.foldAmount(deferredTransactions)),
      expenseAmount: roundOffNumber(expense)
    };
    return dashboard;
  }

  async resolveCashierId(
    req: any,
    cashierId,
    autoStart = false,
    restaurantId = null,
  ) {
    let cashier = null;
    if (!cashierId) {
      if (req.user.isCustomer) {
        cashier = await this.cashierModel.findOne({
          restaurantId,
          default: true,
        });
        if (!cashier)
          throw new BadRequestException(
            VALIDATION_MESSAGES.NoCashierAvailable.key,
          );

        cashierId = cashier._id;
      } else {
        const user = await this.userModel.findById(req.user.userId);
        if (user) cashierId = user.cashier;
        if (!cashierId) {
          cashier = await this.cashierModel.findOne({
            restaurantId,
            default: true,
          });
          if (!cashier)
            throw new BadRequestException(
              VALIDATION_MESSAGES.NoCashierAvailable.key,
            );

          cashierId = cashier._id;
        }
      }
    }

    if (!cashierId) {
      throw new BadRequestException(VALIDATION_MESSAGES.NoCashierAvailable.key);
    }
    if (autoStart) {
      if (!cashier) {
        cashier = await this.cashierModel.findById(cashierId);
        if (!cashier)
          throw new BadRequestException(
            VALIDATION_MESSAGES.NoCashierAvailable.key,
          );
      }
      if (!cashier.currentLog) {
        if (req.user.isCustomer)
          await this.cashierLogService.autoStartCashier(null, cashier);
        // auto start cashier for customer
        else await this.cashierLogService.autoStartCashier(req, cashier); // auto start cashier for staff member
      }
    }

    return cashierId;
  }
}
