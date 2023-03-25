import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, PaginateModel, PaginateResult } from 'mongoose';

import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { CreatePaymentSetupDto } from './dto/create-payment-setup.dto';
import { UpdatePaymentSetupDto } from './dto/update-payment-setup.dto';
import {
  PaymentSetup,
  PaymentSetupDocument,
} from './schemas/payment-setup.schema';
import { QueryPaymentSetupDto } from './dto/query-payment-setup.dto';

@Injectable()
export class PaymentSetupService {
  constructor(
    @InjectModel(PaymentSetup.name)
    private readonly paymentSetupModel: Model<PaymentSetupDocument>,
    @InjectModel(PaymentSetup.name)
    private readonly paymentSetupModelPag: PaginateModel<PaymentSetupDocument>,
  ) {}

  async create(
    req: any,
    dto: CreatePaymentSetupDto,
  ): Promise<PaymentSetupDocument> {
    return await this.paymentSetupModel.findOneAndUpdate(
      {
        supplierId: req.user.supplierId,
        active: true,
      },
      {
        ...dto,
        supplierId: req.user.supplierId,
        addedBy: req.user.userId,
      },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  async findAll(
    req: any,
    query: QueryPaymentSetupDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<PaymentSetupDocument>> {
    const paymentSetups = await this.paymentSetupModelPag.paginate(
      {
        ...query,
        supplierId: req.user.supplierId,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );
    return paymentSetups;
  }

  async findOne(paymentSetupId: string): Promise<PaymentSetupDocument> {
    const exists = await this.paymentSetupModel.findById(paymentSetupId);

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async findOneBySupplier(supplierId: string): Promise<PaymentSetupDocument> {
    const exists = await this.paymentSetupModel.findOne({ supplierId });

    return exists;
  }

  async update(
    paymentSetupId: string,
    dto: UpdatePaymentSetupDto,
  ): Promise<PaymentSetupDocument> {
    const paymentSetup = await this.paymentSetupModel.findByIdAndUpdate(
      paymentSetupId,
      dto,
      {
        new: true,
      },
    );

    if (!paymentSetup) {
      throw new NotFoundException();
    }

    return paymentSetup;
  }

  async remove(paymentSetupId: string): Promise<boolean> {
    const paymentSetup = await this.paymentSetupModel.findByIdAndRemove(
      paymentSetupId,
    );

    if (!paymentSetup) {
      throw new NotFoundException();
    }
    return true;
  }
}
