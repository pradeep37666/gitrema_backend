import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { CreatePrinterDto } from 'src/printer/dto/create-printer.dto';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { I18nContext } from 'nestjs-i18n';
import { Driver, DriverDocument } from './schema/driver.schema';

@Injectable()
export class DriverService {
  constructor(
    @InjectModel(Driver.name)
    private readonly driverModel: Model<DriverDocument>,
    @InjectModel(Driver.name)
    private readonly driverModelPag: PaginateModel<DriverDocument>,
  ) {}

  async create(req: any, dto: CreateDriverDto): Promise<DriverDocument> {
    const driver = await this.driverModel.create({
      ...dto,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });

    return driver;
  }

  async findAll(
    req: any,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<DriverDocument>> {
    const printers = await this.driverModelPag.paginate(
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
    return printers;
  }

  async findOne(driverId: string, i18n: I18nContext): Promise<DriverDocument> {
    const exists = await this.driverModel.findById(driverId);

    if (!exists) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return exists;
  }

  async update(
    driverId: string,
    dto: UpdateDriverDto,
    i18n: I18nContext,
  ): Promise<DriverDocument> {
    const driver = await this.driverModel.findByIdAndUpdate(driverId, dto, {
      new: true,
    });

    if (!driver) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return driver;
  }

  async remove(driverId: string, i18n: I18nContext): Promise<boolean> {
    const printer = await this.driverModel.findByIdAndRemove(driverId);

    if (!printer) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    return true;
  }
}
