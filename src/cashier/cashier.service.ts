import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  Model,
  PaginateModel,
  PaginateResult,
  PopulateOption,
  PopulateOptions,
} from 'mongoose';

import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { Cashier, CashierDocument } from './schemas/cashier.schema';
import { CreateCashierDto } from './dto/create-cashier.dto';
import { UpdateCashierDto } from './dto/update-cashier.dto';
import { CashierHelperService } from './cashier-helper.service';
import { PaymentMethod } from 'src/payment/enum/en.enum';
import { CashierLogService } from './cashier-log.service';
import { CashierLogDocument } from './schemas/cashier-log.schema';
import { PaymentStatus } from 'src/core/Constants/enum';
import { QueryCashierDto } from './dto/cashier-log.dto';
import { User, UserDocument } from 'src/users/schemas/users.schema';

@Injectable()
export class CashierService {
  constructor(
    @InjectModel(Cashier.name)
    private readonly cashierModel: Model<CashierDocument>,
    @InjectModel(Cashier.name)
    private readonly cashierModelPag: PaginateModel<CashierDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly cashierHelperService: CashierHelperService,
    @Inject(forwardRef(() => CashierLogService))
    private readonly cashierLogService: CashierLogService,
  ) {}

  async create(req: any, dto: CreateCashierDto): Promise<CashierDocument> {
    const cashier = await this.cashierModel.create({
      ...dto,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });
    this.cashierHelperService.postCashierCreate(req, cashier);
    return cashier;
  }

  async findAll(
    req: any,
    query: QueryCashierDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<CashierDocument>> {
    let userQuery = {};
    const user = await this.userModel.findById(req.user.userId);
    if (user && user.cashier) {
      userQuery = { _id: user.cashier };
    }

    const cashiers = await this.cashierModelPag.paginate(
      {
        supplierId: req.user.supplierId,
        ...query,
        ...userQuery,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
        populate: [
          {
            path: 'currentLog',
            populate: [
              {
                path: 'transactions',
                populate: query.includeOrders
                  ? [
                      {
                        path: 'orderId',
                      },
                    ]
                  : [],
              },
            ],
          },
        ],
      },
    );
    return cashiers;
  }

  async findOne(cashierId: string): Promise<CashierDocument> {
    const exists = await this.cashierModel.findById(cashierId).populate([
      {
        path: 'currentLog',
        populate: [
          {
            path: 'transactions',
          },
        ],
      },
    ]);

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async update(
    cashierId: string,
    dto: UpdateCashierDto | any,
  ): Promise<CashierDocument> {
    const cashier = await this.cashierModel.findByIdAndUpdate(cashierId, dto, {
      new: true,
    });

    if (!cashier) {
      throw new NotFoundException();
    }
    this.cashierHelperService.postCashierUpdate(cashier, dto);

    return cashier;
  }

  async remove(cashierId: string): Promise<boolean> {
    const cashier = await this.cashierModel.findByIdAndRemove(cashierId);

    if (!cashier) {
      throw new NotFoundException();
    }
    return true;
  }

  async findDashboard(cashierId: string): Promise<any> {
    const cashierData = await this.cashierLogService.current(cashierId);

    return cashierData?.dashboard ?? {};
  }
}
