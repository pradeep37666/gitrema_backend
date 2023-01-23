import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AddSupplierDto, SupplierQueryDto } from './Supplier.dto';
import { Supplier, SupplierDocument } from './schemas/suppliers.schema';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { STATUS_MSG } from 'src/core/Constants/status-message.constants';

@Injectable()
export class SupplierService {
  constructor(
    @InjectModel(Supplier.name)
    private supplierModel: Model<SupplierDocument>,
    @InjectModel(Supplier.name)
    private supplierModelPag: PaginateModel<SupplierDocument>,
  ) {}

  async createSupplier(
    supplierDetails: AddSupplierDto,
  ): Promise<SupplierDocument> {
    console.log(supplierDetails);
    const supplier = new this.supplierModel(supplierDetails);
    return await supplier.save();
  }

  async getAll(
    query: SupplierQueryDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<SupplierDocument>> {
    let criteria: any = { ...query, deletedAt: null };
    if (query.name) {
      const name = query.name;
      delete query.name;
      criteria = {
        ...query,
        deletedAt: null,
        $expr: {
          $regexMatch: {
            input: '$name',
            regex: name,
            options: 'i',
          },
        },
      };
    }
    return await this.supplierModelPag.paginate(criteria, {
      sort: DefaultSort,
      lean: true,
      ...paginateOptions,
      ...pagination,
    });
  }

  async getOne(supplierId: string): Promise<Supplier> {
    return await this.supplierModel.findOne({ _id: supplierId }).populate([
      {
        path: 'allowedServices',
        match: { deleted: null },
      },
    ]);
  }

  async getByDomain(domain: string): Promise<SupplierDocument> {
    return await this.supplierModel
      .findOne({ domain }, { bankDetais: 0, subscriptionDetails: 0 })
      .populate([
        {
          path: 'allowedServices',
          match: { deleted: null },
        },
      ]);
  }

  async isDomainAvailableToUse(domain: string): Promise<boolean> {
    const supplier = await this.supplierModel.findOne({ domain });
    return supplier ? false : true;
  }

  async update(
    supplierId: string,
    supplierDetails: AddSupplierDto,
  ): Promise<Supplier> {
    if (supplierDetails.domain) {
      const isExist = await this.supplierModel.findOne({
        _id: { $ne: supplierId },
        domain: supplierDetails.domain,
      });
      if (isExist)
        throw new BadRequestException(STATUS_MSG.ERROR.DOMAIN_NOT_ALLOWED);
    }
    const user = await this.supplierModel.findByIdAndUpdate(
      { _id: supplierId },
      { ...supplierDetails },
      { new: true },
    );
    return user;
  }

  async delete(supplierId: string): Promise<Supplier> {
    return await this.supplierModel.findByIdAndUpdate(
      { _id: supplierId },
      { deletedAt: new Date() },
    );
  }
}
