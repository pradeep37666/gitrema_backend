import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSelectedVendorDto } from './dto/create-selected-vendor.dto';
import { UpdateSelectedVendorDto } from './dto/update-selected-vendor.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  SelectedVendor,
  SelectedVendorDocument,
} from './schema/selected-vendor.schema';
import { Model } from 'mongoose';
import { PaginateModel } from 'mongoose';
import { I18nContext } from 'nestjs-i18n';
import { QuerySelectedVendorDto } from './dto/query-selected-vendor.dto';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { MongooseQueryParser } from 'mongoose-query-parser';

@Injectable()
export class SelectedVendorService {
  constructor(
    @InjectModel(SelectedVendor.name)
    private readonly selectedVendorModel: Model<SelectedVendorDocument>,
    @InjectModel(SelectedVendor.name)
    private readonly selectedVendorModelPag: PaginateModel<SelectedVendorDocument>,
  ) {}

  async create(
    req: any,
    dto: CreateSelectedVendorDto,
    i18n: I18nContext,
  ): Promise<SelectedVendorDocument> {
    return await this.selectedVendorModel.create({
      ...dto,
      addedBy: req.user.userId,
      supplierId: req.user.supplierId,
    });
  }

  async findAll(
    req: any,
    query: QuerySelectedVendorDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<SelectedVendorDocument>> {
    let queryToApply: any = query;
    if (query.filter) {
      //delete queryToApply.filter;
      const parser = new MongooseQueryParser();
      const parsed = parser.parse(`${query.filter}`);
      queryToApply = { ...queryToApply, ...parsed.filter };
    }
    const records = await this.selectedVendorModelPag.paginate(
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

  async findOne(
    selectedVendorId: string,
    i18n: I18nContext,
  ): Promise<SelectedVendorDocument> {
    const exists = await this.selectedVendorModel.findById(selectedVendorId);

    if (!exists) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return exists;
  }

  async update(
    req,
    selectedVendorId: string,
    dto: UpdateSelectedVendorDto,
    i18n: I18nContext,
  ): Promise<SelectedVendorDocument> {
    const selectedVendor = await this.selectedVendorModel.findByIdAndUpdate(
      selectedVendorId,
      { ...dto },
      {
        new: true,
      },
    );

    if (!selectedVendor) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return selectedVendor;
  }

  async remove(selectedVendorId: string, i18n: I18nContext): Promise<boolean> {
    const selectedVendor = await this.selectedVendorModel.findByIdAndDelete(
      selectedVendorId,
    );

    if (!selectedVendor) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    return true;
  }
}
