import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { LeanDocument, Model, PaginateModel, PaginateResult } from 'mongoose';

import { TransactionQueryDto } from './transaction.dto';

import {
  Transaction,
  TransactionDocument,
} from './schemas/transactions.schema';
import { PaymentTarget } from 'src/core/Constants/enum';
import { STATUS_MSG } from 'src/core/Constants/status-message.constants';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    @InjectModel(Transaction.name)
    private transactionModelPag: PaginateModel<TransactionDocument>,
  ) {}

  async create(req: any, transactionDetail: any): Promise<TransactionDocument> {
    return await this.transactionModel.create({
      ...transactionDetail,
      supplierId: req.type != PaymentTarget.Spn ? req.user.supplierId : null,
      addedBy: req.user.userId,
    });
  }

  async get(transactionId: string): Promise<LeanDocument<TransactionDocument>> {
    const transaction = await this.transactionModel.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException(STATUS_MSG.ERROR.RECORD_NOT_FOUND);
    }

    return transaction;
  }

  async update(
    transactionId: string,
    transactionDetail: any,
  ): Promise<LeanDocument<TransactionDocument>> {
    const transaction = await this.transactionModel
      .findByIdAndUpdate(transactionId, transactionDetail, { new: true })
      .lean();
    if (!transaction) {
      throw new NotFoundException(STATUS_MSG.ERROR.RECORD_NOT_FOUND);
    }
    return transaction;
  }

  async all(
    req: any,
    query: TransactionQueryDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<TransactionDocument>> {
    return await this.transactionModelPag.paginate(
      { ...query },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
        populate: [
          {
            path: 'supplierId',
            select: { name: 1, bankDetais: 1 },
            match: { deletedAt: null },
          },
          {
            path: 'reservationId',
            select: { reservationNumber: 1 },
          },
        ],
      },
    );
  }
}
