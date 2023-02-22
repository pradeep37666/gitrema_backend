import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  AddSupplierDto,
  AssignPackageDto,
  SupplierQueryDto,
  UpdateSupplierDto,
} from './Supplier.dto';
import { Supplier, SupplierDocument } from './schemas/suppliers.schema';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { STATUS_MSG } from 'src/core/Constants/status-message.constants';
import { MenuItem, MenuItemDocument } from 'src/menu/schemas/menu-item.schema';
import {
  MenuAddition,
  MenuAdditionDocument,
} from 'src/menu/schemas/menu-addition.schema';
import { Package, PackageDocument } from 'src/package/schemas/package.schema';
import {
  SupplierPackage,
  SupplierPackageDocument,
} from './schemas/supplier-package.schema';
import * as moment from 'moment';

@Injectable()
export class SupplierService {
  constructor(
    @InjectModel(Supplier.name)
    private supplierModel: Model<SupplierDocument>,
    @InjectModel(Supplier.name)
    private supplierModelPag: PaginateModel<SupplierDocument>,
    @InjectModel(MenuItem.name)
    private menuItemModel: Model<MenuItemDocument>,
    @InjectModel(MenuAddition.name)
    private menuAdditionModel: Model<MenuAdditionDocument>,
    @InjectModel(Package.name)
    private packageModel: Model<PackageDocument>,
    @InjectModel(SupplierPackage.name)
    private supplierPackagemodel: Model<SupplierPackageDocument>,
  ) {}

  async createSupplier(
    supplierDetails: AddSupplierDto,
  ): Promise<SupplierDocument> {
    const supplier = new this.supplierModel(supplierDetails);
    if (supplier.taxEnabled) {
      await this.menuItemModel.updateMany(
        { supplierId: supplier._id },
        { taxEnabled: true },
      );
      await this.menuAdditionModel.updateMany(
        { supplierId: supplier._id },
        { taxEnabled: true },
      );
    }
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
    return await this.supplierModel.findOne({ _id: supplierId });
  }

  async getByDomain(domain: string): Promise<SupplierDocument> {
    return await this.supplierModel
      .findOne({ domain }, { bankDetais: 0, subscriptionDetails: 0 })
      .lean();
  }

  async isDomainAvailableToUse(domain: string): Promise<boolean> {
    const supplier = await this.supplierModel.findOne({ domain });
    return supplier ? false : true;
  }

  async update(
    supplierId: string,
    supplierDetails: UpdateSupplierDto,
  ): Promise<Supplier> {
    if (supplierDetails.domain) {
      const isExist = await this.supplierModel.findOne({
        _id: { $ne: supplierId },
        domain: supplierDetails.domain,
      });
      if (isExist)
        throw new BadRequestException(STATUS_MSG.ERROR.DOMAIN_NOT_ALLOWED);
    }
    const supplier = await this.supplierModel.findByIdAndUpdate(
      { _id: supplierId },
      { ...supplierDetails },
      { new: true },
    );
    if (
      supplierDetails.taxEnabled === true ||
      supplierDetails.taxEnabled === false
    ) {
      await this.menuItemModel.updateMany(
        { supplierId: supplier._id },
        { taxEnabled: supplierDetails.taxEnabled },
      );
      await this.menuAdditionModel.updateMany(
        { supplierId: supplier._id },
        { taxEnabled: supplierDetails.taxEnabled },
      );
    }
    return supplier;
  }

  async assignPackage(req: any, supplierId: string, dto: AssignPackageDto) {
    let packageCriteria: any = { isDefault: true };
    if (dto.packageId) {
      packageCriteria = { _id: dto.packageId };
    }
    const packageObj = await this.packageModel.findOne(packageCriteria);
    if (!packageObj) {
      throw new BadRequestException(`Package not found`);
    }
    if (dto.startTrial && packageObj.trialPeriod == 0) {
      throw new BadRequestException(`Package does not provide trial period`);
    }
    return await this.createSupplierPackage(req, packageObj, supplierId, dto);
  }

  async createSupplierPackage(
    req: any,
    packageObj: PackageDocument,
    supplierId: string,
    dto: AssignPackageDto,
  ) {
    const startDate =
      dto.startDate ?? new Date(moment.utc().format('YYYY-MM-DD'));
    let dates: any = {
      subscriptionStartingDate: startDate,
      subscriptionExpiryDate: moment
        .utc(startDate)
        .add(packageObj.days, 'd')
        .format('YYYY-MM-DD'),
      subscriptionExpiryDateWithGrace: moment
        .utc(startDate)
        .add(packageObj.days + packageObj.gracePeriod, 'd')
        .format('YYYY-MM-DD'),
    };
    if (dto.startTrial) {
      dates = {
        trialPeriodStartingDate: startDate,
        trialPeriodExpiryDate: moment
          .utc(startDate)
          .add(packageObj.trialPeriod, 'd')
          .format('YYYY-MM-DD'),
      };
    }

    const packageObjToApply = packageObj.toObject();
    delete packageObjToApply._id;
    delete packageObjToApply.createdAt;
    delete packageObjToApply.updatedAt;

    const supplierPackage = await this.supplierPackagemodel.create({
      supplierId,
      packageId: packageObj._id,
      ...packageObjToApply,
      ...dates,
      addedBy: req ? req.user.userId : null,
    });
    if (supplierPackage) {
      await this.supplierPackagemodel.findOneAndUpdate(
        {
          supplierId,
          _id: { $ne: supplierPackage._id },
          active: true,
        },
        { active: false },
      );
    }
    return supplierPackage;
  }

  async delete(supplierId: string): Promise<Supplier> {
    return await this.supplierModel.findByIdAndUpdate(
      { _id: supplierId },
      { deletedAt: new Date() },
    );
  }
}
