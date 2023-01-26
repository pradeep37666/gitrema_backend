import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model, PaginateModel, PaginateResult } from 'mongoose';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import {
  ClientFeedback,
  ClientFeedbackDocument,
} from './schemas/client-feedback.schema';
import { CreateClientFeedbackDto } from './dto/create-client-feedback.dto';
import { UpdateClientFeedbackDto } from './dto/update-client-feedback.dto';

@Injectable()
export class ClientFeedbackService {
  constructor(
    @InjectModel(ClientFeedback.name)
    private readonly clientFeedbackModel: Model<ClientFeedbackDocument>,
    @InjectModel(ClientFeedback.name)
    private readonly clientFeedbackModelPag: PaginateModel<ClientFeedbackDocument>,
  ) {}

  async create(
    req: any,
    dto: CreateClientFeedbackDto,
  ): Promise<ClientFeedbackDocument> {
    if (dto.active) {
      await this.clientFeedbackModel.updateMany(
        {
          supplierId: req.user.supplierId,
        },
        { $set: { active: false } },
      );
    }
    return await this.clientFeedbackModel.create({
      ...dto,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });
  }

  async findAll(
    req: any,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<ClientFeedbackDocument>> {
    const clientFeedbacks = await this.clientFeedbackModelPag.paginate(
      {
        supplierId: req.user.supplierId,
        deletedAt: null,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );
    return clientFeedbacks;
  }

  async findOne(clientFeedbackId: string): Promise<ClientFeedbackDocument> {
    const exists = await this.clientFeedbackModel.findById(clientFeedbackId);

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async update(
    req: any,
    clientFeedbackId: string,
    dto: UpdateClientFeedbackDto,
  ): Promise<ClientFeedbackDocument> {
    if (dto.active) {
      await this.clientFeedbackModel.updateMany(
        {
          supplierId: req.user.supplierId,
        },
        { $set: { active: false } },
      );
    }
    const clientFeedback = await this.clientFeedbackModel.findByIdAndUpdate(
      clientFeedbackId,
      dto,
      { new: true },
    );

    if (!clientFeedback) {
      throw new NotFoundException();
    }

    return clientFeedback;
  }

  async remove(clientFeedbackId: string): Promise<boolean> {
    const clientFeedback = await this.clientFeedbackModel.findByIdAndUpdate(
      clientFeedbackId,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!clientFeedback) {
      throw new NotFoundException();
    }
    return true;
  }
}
