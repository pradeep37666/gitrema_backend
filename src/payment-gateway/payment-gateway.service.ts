import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentGatewayDto } from './dto/create-payment-gateway.dto';
import { UpdatePaymentGatewayDto } from './dto/update-payment-gateway.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  PaymentGateway,
  PaymentGatewayDocument,
} from './schema/payment-gateway.schema';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { QueryPaymentGatewayDto } from './dto/query-payment-gateway.dto';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { MongooseQueryParser } from 'mongoose-query-parser';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class PaymentGatewayService {
  constructor(
    @InjectModel(PaymentGateway.name)
    private readonly paymentGatewayModel: Model<PaymentGatewayDocument>,
    @InjectModel(PaymentGateway.name)
    private readonly paymentGatewayModelPag: PaginateModel<PaymentGatewayDocument>,
  ) {}

  async create(
    req: any,
    dto: CreatePaymentGatewayDto,
  ): Promise<PaymentGatewayDocument> {
    return await this.paymentGatewayModel.findOneAndUpdate(
      {
        supplierId: dto.supplierId,
      },
      {
        ...dto,

        addedBy: req.user.userId,
      },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  async findAll(
    req: any,
    query: QueryPaymentGatewayDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<PaymentGatewayDocument>> {
    let queryToApply: any = query;
    if (query.filter) {
      //delete queryToApply.filter;
      const parser = new MongooseQueryParser();
      const parsed = parser.parse(`${query.filter}`);
      queryToApply = { ...queryToApply, ...parsed.filter };
    }
    const records = await this.paymentGatewayModelPag.paginate(
      {
        ...queryToApply,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );
    return records;
  }

  async findOne(
    paymentGatewayId: string,
    i18n: I18nContext,
  ): Promise<PaymentGatewayDocument> {
    const exists = await this.paymentGatewayModel.findById(paymentGatewayId);

    if (!exists) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return exists;
  }

  async findOneBySupplier(supplierId: string): Promise<PaymentGatewayDocument> {
    const exists = await this.paymentGatewayModel.findOne({ supplierId });

    return exists;
  }

  async update(
    paymentGatewayId: string,
    dto: UpdatePaymentGatewayDto,
    i18n: I18nContext,
  ): Promise<PaymentGatewayDocument> {
    const paymentGateway = await this.paymentGatewayModel.findByIdAndUpdate(
      paymentGatewayId,
      dto,
      {
        new: true,
      },
    );

    if (!paymentGateway) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return paymentGateway;
  }

  async remove(paymentGatewayId: string, i18n: I18nContext): Promise<boolean> {
    const paymentGateway = await this.paymentGatewayModel.findByIdAndRemove(
      paymentGatewayId,
    );

    if (!paymentGateway) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    return true;
  }
}
