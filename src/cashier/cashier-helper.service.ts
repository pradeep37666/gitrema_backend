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

@Injectable()
export class CashierHelperService {
  constructor(
    @InjectModel(Cashier.name)
    private readonly cashierModel: Model<CashierDocument>,
    @Inject(forwardRef(() => CashierLogService))
    private readonly cashierLogService: CashierLogService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
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
          supplierId: cashier.supplierId,
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

  async resolveCashierId(req: any, cashierId, autoStart = false) {
    let cashier = null;
    if (!cashierId) {
      if (req.user.isCustomer) {
        cashier = await this.cashierModel.findOne({
          supplierId: req.user.supplierId,
          default: true,
        });
        if (!cashier) throw new BadRequestException(`Cashier is not available`);

        cashierId = cashier._id;
      } else {
        const user = await this.userModel.findById(req.user.userId);
        if (user) cashierId = user.cashier;
      }
    }

    if (!cashierId) {
      throw new BadRequestException(`Cashier is not available`);
    }
    if (autoStart) {
      if (!cashier) {
        cashier = await this.cashierModel.findById(cashierId);
        if (!cashier) throw new BadRequestException(`Cashier is not available`);
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
