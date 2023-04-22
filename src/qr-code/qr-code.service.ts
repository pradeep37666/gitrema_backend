import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import mongoose, { Model, PaginateModel, PaginateResult } from 'mongoose';

import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { QrCode, QrCodeDocument } from './schemas/qr-code.schema';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { UpdateQrCodeDto } from './dto/update-qr-code.dto';
import * as QrCodeLib from 'qrcode';
import { QrCodeType } from './enum/en.enum';
import { Table, TableDocument } from 'src/table/schemas/table.schema';
import { S3Service } from 'src/core/Providers/Storage/S3.service';
import { VALIDATION_MESSAGES } from 'src/core/Constants/validation-message';

@Injectable()
export class QrCodeService {
  constructor(
    @InjectModel(QrCode.name)
    private readonly qrCodeModel: Model<QrCodeDocument>,
    @InjectModel(QrCode.name)
    private readonly qrCodeModelPag: PaginateModel<QrCodeDocument>,
    @InjectModel(Table.name)
    private readonly tableModel: Model<TableDocument>,
    private readonly s3Service: S3Service,
  ) {}

  async create(req: any, dto: CreateQrCodeDto): Promise<any> {
    if (dto.dataIds && dto.dataIds.length < 1) {
      throw new BadRequestException(`dataIds should have atleast one id.`);
    }

    return await Promise.all(
      dto.dataIds.map(async (dataId) => {
        return await this.qrCodeModel.findOneAndUpdate(
          {
            supplierId: req.user.supplierId,
            type: dto.type,
            dataId: dataId,
          },
          {
            ...dto,
            supplierId: req.user.supplierId,
            addedBy: req.user.userId,
            url: await this.generateAndStoreQrCode(dto.type, dataId),
          },
          { upsert: true, setDefaultsOnInsert: true, new: true },
        );
      }),
    );
  }

  async generateAndStoreQrCode(type, dataId) {
    let url = '',
      directory = '';
    if (type == QrCodeType.Table) {
      const table = await this.tableModel.findById(dataId).populate([
        {
          path: 'supplierId',
        },
      ]);
      if (!table)
        throw new BadRequestException(VALIDATION_MESSAGES.TableNotFound.key);
      if (!table?.supplierId?.domain)
        throw new BadRequestException(VALIDATION_MESSAGES.DomainNotFound.key);
      const domain = table.supplierId.domain.endsWith('/')
        ? table.supplierId.domain.slice(0, -1)
        : table.supplierId.domain;
      url = domain + '/' + table._id + '/' + table.restaurantId;
      directory = table.supplierId._id + '/' + table.restaurantId + '/qrcodes/';
    }
    const pattern = /^((http|https):\/\/)/;

    if (!pattern.test(url)) {
      url = 'https://' + url;
    }
    const path = './upload/' + dataId + '.png';
    await QrCodeLib.toFile(path, url, {
      errorCorrectionLevel: 'H',
      scale: 20,
      margin: 5,
    });

    const s3Url: any = await this.s3Service.uploadLocalFile(path, directory);

    console.log(s3Url);
    if (s3Url.Location) return s3Url.Location;

    throw new BadRequestException(VALIDATION_MESSAGES.ErrorQrCode.key);
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
