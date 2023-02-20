import { CreateClientCommentDto } from './dto/create-client-comment.dto';

import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model, PaginateModel, PaginateResult } from 'mongoose';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import {
  ClientComment,
  ClientCommentDocument,
} from './schemas/client-comment.schema';
import { QueryClientCommentDto } from './dto/query-client-comment.dto';

@Injectable()
export class ClientCommentService {
  constructor(
    @InjectModel(ClientComment.name)
    private readonly clientCommentModel: Model<ClientCommentDocument>,
    @InjectModel(ClientComment.name)
    private readonly clientCommentModelPag: PaginateModel<ClientCommentDocument>,
  ) {}

  async create(
    req: any,
    dto: CreateClientCommentDto,
  ): Promise<ClientCommentDocument> {
    return await this.clientCommentModel.create({
      ...dto,
      customerId: req.user.userId,
    });
  }

  async findAll(
    req: any,
    query: QueryClientCommentDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<ClientCommentDocument>> {
    const comments = await this.clientCommentModelPag.paginate(
      {
        ...query,
        supplierId: req.user.supplierId,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
        populate: [
          {
            path: 'customerId',
            select: { name: 1 },
          },
          {
            path: 'menuItemId',
            select: { name: 1, nameAr: 1 },
          },
          {
            path: 'orderId',
            select: { orderType: 1 },
          },
        ],
      },
    );
    return comments;
  }
}
