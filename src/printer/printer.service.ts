import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePrinterDto } from './dto/create-printer.dto';
import { UpdatePrinterDto } from './dto/update-printer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Printer, PrinterDocument } from './schema/printer.schema';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class PrinterService {
  constructor(
    @InjectModel(Printer.name)
    private readonly printerModel: Model<PrinterDocument>,
    @InjectModel(Printer.name)
    private readonly printerModelPag: PaginateModel<PrinterDocument>,
  ) {}

  async create(req: any, dto: CreatePrinterDto): Promise<PrinterDocument> {
    const printer = await this.printerModel.create({
      ...dto,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });
    if (dto.isDefault == true) {
      await this.printerModel.updateMany(
        {
          supplierId: printer.supplierId,
          _id: { $ne: printer._id },
          type: printer.type,
        },
        { isDefault: false },
      );
    }
    return printer;
  }

  async findAll(
    req: any,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<PrinterDocument>> {
    const printers = await this.printerModelPag.paginate(
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
    return printers;
  }

  async fetchBySupplier(supplierId): Promise<PrinterDocument[]> {
    return await this.printerModel.find({ supplierId });
  }

  async findOne(
    printerId: string,
    i18n: I18nContext,
  ): Promise<PrinterDocument> {
    const exists = await this.printerModel.findById(printerId);

    if (!exists) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return exists;
  }

  async update(
    printerId: string,
    dto: UpdatePrinterDto,
    i18n: I18nContext,
  ): Promise<PrinterDocument> {
    const printer = await this.printerModel.findByIdAndUpdate(printerId, dto, {
      new: true,
    });

    if (!printer) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    if (dto.isDefault == true) {
      await this.printerModel.updateMany(
        {
          supplierId: printer.supplierId,
          _id: { $ne: printer._id },
          type: printer.type,
        },
        { isDefault: false },
      );
    }

    return printer;
  }

  async remove(printerId: string, i18n: I18nContext): Promise<boolean> {
    const printer = await this.printerModel.findByIdAndUpdate(
      printerId,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!printer) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    return true;
  }
}
