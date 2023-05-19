import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel } from 'mongoose';

import {
  ProfitDetail,
  ProfitDetailDocument,
} from './schema/profit-detail.schema';
import { QueryProfitDetailDto } from './dto/query-profit-detail.dto';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { MongooseQueryParser } from 'mongoose-query-parser';

@Injectable()
export class ProfitDetailService {
  constructor(
    @InjectModel(ProfitDetail.name)
    private readonly profitdetailModel: Model<ProfitDetailDocument>,
    @InjectModel(ProfitDetail.name)
    private readonly profitdetailModelPag: PaginateModel<ProfitDetailDocument>,
  ) {}

  async findAll(
    req: any,
    query: QueryProfitDetailDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<ProfitDetailDocument>> {
    let queryToApply: any = query;
    if (query.filter) {
      //delete queryToApply.filter;
      const parser = new MongooseQueryParser();
      const parsed = parser.parse(`${query.filter}`);
      queryToApply = { ...queryToApply, ...parsed.filter };
    }
    const records = await this.profitdetailModelPag.paginate(
      {
        ...queryToApply,
        supplierId: req.user.supplierId,
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

  async updatePaymentStatus(orderId: string, paymentStatus: string) {
    await this.profitdetailModel.updateMany({ orderId }, { paymentStatus });
  }
}
