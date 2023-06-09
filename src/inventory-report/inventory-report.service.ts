import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel } from 'mongoose';
import {
  SelectedVendor,
  SelectedVendorDocument,
} from 'src/selected-vendor/schema/selected-vendor.schema';
import { MaterialPriceReportDto } from './dto/material-price-report.dto';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { CostReportDto } from './dto/cost-report.dto';
import {
  ProfitDetail,
  ProfitDetailDocument,
} from 'src/profit-detail/schema/profit-detail.schema';
import { List, ListDocument } from 'src/list/schemas/list.schema';

@Injectable()
export class InventoryReportService {
  constructor(
    @InjectModel(SelectedVendor.name)
    private readonly selectedVendorModelPag: PaginateModel<SelectedVendorDocument>,
    @InjectModel(ProfitDetail.name)
    private readonly profitDetailModel: Model<ProfitDetailDocument>,
    @InjectModel(List.name)
    private readonly listModel: Model<ListDocument>,
  ) {}
  async materialPriceReport(
    req,
    query: MaterialPriceReportDto,
    paginateOptions: PaginationDto,
  ) {
    const records = await this.selectedVendorModelPag.paginate(
      {
        ...query,
        supplierId: req.user.supplierId,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
        projection: {
          restaurantId: 1,
          vendorId: 1,
          materialId: 1,
          cost: 1,
        },
        populate: [
          {
            path: 'restaurantId',
            select: {
              _id: 1,
              name: 1,
              nameAr: 1,
            },
          },
          {
            path: 'vendorId',
            select: {
              _id: 1,
              name: 1,
              nameAr: 1,
            },
          },
          {
            path: 'materialId',
            select: {
              _id: 1,
              name: 1,
              nameAr: 1,
            },
          },
        ],
      },
    );
    return records;
  }
  async costReport(req, query: CostReportDto) {
    const queryToApply: any = query;
    if (query.startDate && query.endDate) {
      queryToApply.createdAt = {
        $gte: new Date(new Date(query.startDate).setHours(0, 0, 0)),
        $lte: new Date(new Date(query.endDate).setHours(23, 59, 59)),
      };
    }
    const records = await this.profitDetailModel
      .find(
        {
          ...queryToApply,
          supplierId: req.user.supplierId,
        },
        {
          restaurantId: 1,
          materialId: 1,
          unitCost: 1,
          createdAt: 1,
        },
      )
      .populate([
        {
          path: 'restaurantId',
          select: {
            _id: 1,
            name: 1,
            nameAr: 1,
          },
        },
        {
          path: 'materialId',
          select: {
            _id: 1,
            name: 1,
            nameAr: 1,
            category: 1,
          },
        },
      ]);

    let categories = await this.listModel.find(
      {
        _id: {
          $in: records.map((r) => {
            return r.materialId?.category;
          }),
        },
      },
      { _id: 1, name: 1, nameAr: 1 },
    );
    categories = categories.reduce((acc, d) => {
      acc[d._id.toString()] = d;
      return acc;
    }, []);
    const response = [];
    for (const i in records) {
      if (
        !response[
          records[i].restaurantId._id.toString() +
            '_' +
            records[i].materialId.category?.toString()
        ]
      ) {
        response[
          records[i].restaurantId._id.toString() +
            '_' +
            records[i].materialId.category?.toString()
        ] = {
          restaurant: records[i].restaurantId,
          category: categories[records[i].materialId.category?.toString()] ?? {
            name: 'undefined',
          },
          materials: [],
        };
      }
      response[
        records[i].restaurantId._id.toString() +
          '_' +
          records[i].materialId.category?.toString()
      ].materials.push({
        ...records[i].materialId.toObject(),
        date: records[i].createdAt,
        cost: records[i].unitCost,
      });
    }
    console.log(response);
    return Object.values(response);
  }
}
