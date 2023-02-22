import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Package, PackageDocument } from './schemas/package.schema';
import {
  SupplierPackage,
  SupplierPackageDocument,
} from 'src/supplier/schemas/supplier-package.schema';
import { AssignPackageDto } from 'src/supplier/Supplier.dto';
import { SupplierService } from 'src/supplier/Supplier.service';

@Injectable()
export class PackageService {
  constructor(
    @InjectModel(Package.name)
    private readonly packageModel: Model<PackageDocument>,
    @InjectModel(Package.name)
    private readonly packageModelPag: PaginateModel<PackageDocument>,
    @InjectModel(SupplierPackage.name)
    private supplierPackagemodel: Model<SupplierPackageDocument>,
    private readonly supplierService: SupplierService,
  ) {}

  async create(req: any, dto: CreatePackageDto): Promise<PackageDocument> {
    if (dto.isDefaultPackage == true) {
      await this.packageModel.updateMany(
        {},
        { $set: { isDefaultPackage: false } },
      );
    }
    return await this.packageModel.create({
      ...dto,
      addedBy: req.user.userId,
    });
  }

  async findAll(
    req: any,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<PackageDocument>> {
    const packages = await this.packageModelPag.paginate(
      {},
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );
    return packages;
  }

  async findOne(packageId: string): Promise<PackageDocument> {
    const exists = await this.packageModel.findById(packageId);

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async update(
    req: any,
    packageId: string,
    dto: UpdatePackageDto,
  ): Promise<PackageDocument> {
    if (dto.isDefaultPackage == true) {
      await this.packageModel.updateMany(
        {},
        { $set: { isDefaultPackage: false } },
      );
    }
    const packageObj = await this.packageModel.findByIdAndUpdate(
      packageId,
      dto,
      {
        new: true,
      },
    );

    if (!packageObj) {
      throw new NotFoundException();
    }
    this.handlePostPackageUpdate(req, packageObj, dto);

    return packageObj;
  }

  async handlePostPackageUpdate(
    req: any,
    packageObj: PackageDocument,
    dto: UpdatePackageDto,
  ) {
    if (dto.applyToExistingSubscribers) {
      const supplierPackages = await this.supplierPackagemodel.find({
        packageId: packageObj._id,
        active: true,
      });
      for (const i in supplierPackages) {
        const assignDto: AssignPackageDto = {
          packageId: packageObj._id,
          startTrial: supplierPackages[i].subscriptionStartingDate
            ? false
            : true,
          startDate:
            supplierPackages[i].subscriptionStartingDate ??
            supplierPackages[i].trialPeriodStartingDate,
        };
        this.supplierService.createSupplierPackage(
          req,
          packageObj,
          supplierPackages[i].supplierId.toString(),
          assignDto,
        );
      }
    }
  }

  async remove(packageId: string): Promise<boolean> {
    const packageObj = await this.packageModel.findByIdAndRemove(packageId);

    if (!packageObj) {
      throw new NotFoundException();
    }
    return true;
  }
}
