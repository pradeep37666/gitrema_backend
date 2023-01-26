import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, PaginateModel, PaginateResult } from 'mongoose';

import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { QrCode, QrCodeDocument } from './schemas/qr-code.schema';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { UpdateQrCodeDto } from './dto/update-qr-code.dto';

@Injectable()
export class QrCodeService {
  constructor(
    @InjectModel(QrCode.name)
    private readonly qrCodeModel: Model<QrCodeDocument>,
    @InjectModel(QrCode.name)
    private readonly qrCodeModelPag: PaginateModel<QrCodeDocument>,
  ) {}

  async create(req: any, dto: CreateQrCodeDto): Promise<QrCodeDocument> {
    return await this.qrCodeModel.create({
      ...dto,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });
  }

  async findAll(
    req: any,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<QrCodeDocument>> {
    const qrCodes = await this.qrCodeModelPag.paginate(
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
    return qrCodes;
  }

  async findOne(qrCodeId: string): Promise<QrCodeDocument> {
    const exists = await this.qrCodeModel.findById(qrCodeId);

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async update(
    qrCodeId: string,
    dto: UpdateQrCodeDto,
  ): Promise<QrCodeDocument> {
    const qrCode = await this.qrCodeModel.findByIdAndUpdate(qrCodeId, dto, {
      new: true,
    });

    if (!qrCode) {
      throw new NotFoundException();
    }

    return qrCode;
  }

  async remove(qrCodeId: string): Promise<boolean> {
    const qrCode = await this.qrCodeModel.findByIdAndRemove(qrCodeId);

    if (!qrCode) {
      throw new NotFoundException();
    }
    return true;
  }
}
