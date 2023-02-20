import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, PaginateModel, PaginateResult } from 'mongoose';

import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { Cashier, CashierDocument } from './schemas/cashier.schema';
import { CreateCashierDto } from './dto/create-cashier.dto';
import { UpdateCashierDto } from './dto/update-cashier.dto';

@Injectable()
export class CashierService {
  constructor(
    @InjectModel(Cashier.name)
    private readonly cashierModel: Model<CashierDocument>,
    @InjectModel(Cashier.name)
    private readonly cashierModelPag: PaginateModel<CashierDocument>,
  ) {}

  async create(req: any, dto: CreateCashierDto): Promise<CashierDocument> {
    return await this.cashierModel.create({
      ...dto,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });
  }

  async findAll(
    req: any,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<CashierDocument>> {
    const cashiers = await this.cashierModelPag.paginate(
      {
        supplierId: req.user.supplierId,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );
    return cashiers;
  }

  async findOne(cashierId: string): Promise<CashierDocument> {
    const exists = await this.cashierModel.findById(cashierId);

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async update(
    cashierId: string,
    dto: UpdateCashierDto,
  ): Promise<CashierDocument> {
    const cashier = await this.cashierModel.findByIdAndUpdate(cashierId, dto, {
      new: true,
    });

    if (!cashier) {
      throw new NotFoundException();
    }

    return cashier;
  }

  async remove(cashierId: string): Promise<boolean> {
    const cashier = await this.cashierModel.findByIdAndRemove(cashierId);

    if (!cashier) {
      throw new NotFoundException();
    }
    return true;
  }
}
