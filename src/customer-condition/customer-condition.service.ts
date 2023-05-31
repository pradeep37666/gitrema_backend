import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerConditionDto } from './dto/create-customer-condition.dto';
import { UpdateCustomerConditionDto } from './dto/update-customer-condition.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  CustomerCondition,
  CustomerConditionDocument,
} from './schema/customer-condition.schema';
import { Model, PaginateResult } from 'mongoose';
import { PaginateModel } from 'mongoose';
import { I18nContext } from 'nestjs-i18n';
import { QueryCustomerConditionDto } from './dto/query-customer-condition.dto';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { MongooseQueryParser } from 'mongoose-query-parser';
import {
  SelectedVendor,
  SelectedVendorDocument,
} from 'src/selected-vendor/schema/selected-vendor.schema';
import { UnitOfMeasureHelperService } from 'src/unit-of-measure/unit-of-measure-helper.service';

@Injectable()
export class CustomerConditionService {
  constructor(
    @InjectModel(CustomerCondition.name)
    private readonly customerConditionModel: Model<CustomerConditionDocument>,
    @InjectModel(CustomerCondition.name)
    private readonly customerConditionModelPag: PaginateModel<CustomerConditionDocument>,
    @InjectModel(SelectedVendor.name)
    private readonly selectedVendorModel: Model<SelectedVendorDocument>,
    private readonly unitOfMeasureHelperService: UnitOfMeasureHelperService,
  ) {}

  async create(
    req: any,
    dto: CreateCustomerConditionDto,
    i18n: I18nContext,
  ): Promise<CustomerConditionDocument> {
    const customerCondition = await this.customerConditionModel.create({
      ...dto,
      addedBy: req.user.userId,
      vendorId: req.user.supplierId,
    });
    this.afterPriceUpdate(customerCondition);
    return customerCondition;
  }

  async findAll(
    req: any,
    query: QueryCustomerConditionDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<CustomerConditionDocument>> {
    let queryToApply: any = query;
    if (query.filter) {
      //delete queryToApply.filter;
      const parser = new MongooseQueryParser();
      const parsed = parser.parse(`${query.filter}`);
      queryToApply = { ...queryToApply, ...parsed.filter };
    }
    const records = await this.customerConditionModelPag.paginate(
      {
        ...queryToApply,
        vendorId: req.user.supplierId,
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
    customerConditionId: string,
    i18n: I18nContext,
  ): Promise<CustomerConditionDocument> {
    const exists = await this.customerConditionModel.findById(
      customerConditionId,
    );

    if (!exists) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return exists;
  }

  async update(
    req,
    customerConditionId: string,
    dto: UpdateCustomerConditionDto,
    i18n: I18nContext,
  ): Promise<CustomerConditionDocument> {
    const customerCondition =
      await this.customerConditionModel.findByIdAndUpdate(
        customerConditionId,
        { ...dto },
        {
          new: true,
        },
      );

    if (!customerCondition) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    if (dto.cost) {
      this.afterPriceUpdate(customerCondition);
    }

    return customerCondition;
  }

  async remove(
    customerConditionId: string,
    i18n: I18nContext,
  ): Promise<boolean> {
    const customerCondition =
      await this.customerConditionModel.findByIdAndDelete(customerConditionId);

    if (!customerCondition) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    return true;
  }

  async afterPriceUpdate(customerCondition: CustomerConditionDocument) {
    const vendorInfoRecord = await this.selectedVendorModel.findOne({
      vendorMaterialId: customerCondition.vendorMaterialId,
      restaurantId: customerCondition.restaurantId,
    });

    let conversionFactor = 1;
    if (vendorInfoRecord.uom.toString() != customerCondition.uom.toString()) {
      try {
        const convert =
          await this.unitOfMeasureHelperService.getConversionFactor(
            customerCondition.uom,
            vendorInfoRecord.uom,
          );
        conversionFactor = convert.conversionFactor;
      } catch (err) {
        console.error(err);
      }
    }
    const calculatedCost =
      (vendorInfoRecord.quantity * customerCondition.cost) /
      (customerCondition.quantity * conversionFactor);

    vendorInfoRecord.cost = calculatedCost;

    vendorInfoRecord.save();
  }
}
