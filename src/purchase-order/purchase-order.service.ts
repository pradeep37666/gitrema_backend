import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  PurchaseOrder,
  PurchaseOrderDocument,
} from './schemas/purchase-order.schema';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { QueryPurchaseOrderDto } from './dto/query-purchase-order.dto';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { MongooseQueryParser } from 'mongoose-query-parser';
import { I18nContext } from 'nestjs-i18n';
import {
  Material,
  MaterialDocument,
} from 'src/material/schemas/material.schema';
import { roundOffNumber } from 'src/core/Helpers/universal.helper';
import { Tax } from 'src/core/Constants/tax-rate.constant';
import {
  Restaurant,
  RestaurantDocument,
} from 'src/restaurant/schemas/restaurant.schema';
import { AggregatePaginateModel } from 'mongoose';
import { AggregatePaginateResult } from 'mongoose';
import { QueryPurchaseOrderPreviewDto } from './dto/query-purchase-order-preview.dto';
import mongoose from 'mongoose';
import {
  RestaurantMaterial,
  RestaurantMaterialDocument,
} from 'src/material/schemas/restaurant-material.schema';
import { Vendor, VendorDocument } from 'src/vendor/schemas/vendor.schema';
import { UnitOfMeasureHelperService } from 'src/unit-of-measure/unit-of-measure-helper.service';
import { SelectedVendor } from '../selected-vendor/schema/selected-vendor.schema';
import {
  UnitOfMeasure,
  UnitOfMeasureDocument,
} from 'src/unit-of-measure/schemas/unit-of-measure.schema';
import { PurchaseOrderStatus } from './enum/en';
import { FillToParDto } from './dto/fill-to-par.dto';
import { PurchaseOrderHelperService } from './purchase-order-helper.service';

@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectModel(PurchaseOrder.name)
    private readonly purchaseOrderModel: Model<PurchaseOrderDocument>,
    @InjectModel(PurchaseOrder.name)
    private readonly purchaseOrderModelPag: PaginateModel<PurchaseOrderDocument>,
    @InjectModel(Material.name)
    private readonly materialModel: Model<MaterialDocument>,
    @InjectModel(RestaurantMaterial.name)
    private readonly restaurantMaterialModel: AggregatePaginateModel<RestaurantMaterialDocument>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Vendor.name)
    private readonly vendorModel: Model<VendorDocument>,
    private readonly unitOfMeasureHelperService: UnitOfMeasureHelperService,
    @InjectModel(UnitOfMeasure.name)
    private readonly unitOfMeasureModel: Model<UnitOfMeasureDocument>,
    private readonly purchaseOrderHelperService: PurchaseOrderHelperService,
  ) {}

  async create(
    req: any,
    dto: CreatePurchaseOrderDto,
    i18n: I18nContext,
  ): Promise<PurchaseOrderDocument> {
    const material = await this.materialModel.count({
      _id: {
        $in: dto.items.map((i) => {
          return i.materialId;
        }),
      },
      supplierId: req.user.supplierId,
    });
    if (material != dto.items.length) {
      throw new BadRequestException(i18n.t(`SOME_ITEMS_NOT_FOUND`));
    }
    const items: any = dto.items;
    let totalCost = 0;
    items.forEach((i) => {
      const itemTaxableAmount = roundOffNumber(i.cost / (1 + Tax.rate / 100));
      i.tax = (itemTaxableAmount * Tax.rate) / 100;
      i.netPrice = itemTaxableAmount;
      i.stockValue = i.stock * i.cost;
      totalCost += i.stockValue;
    });
    const totalTaxableAmount = roundOffNumber(totalCost / (1 + Tax.rate / 100));
    const tax = (totalTaxableAmount * Tax.rate) / 100;
    let poNumber = 100001;
    const lastPurchaseOrder = await this.purchaseOrderModel.findOne(
      { supplierId: req.user.supplierId },
      {},
      {
        sort: {
          poNumber: -1,
        },
      },
    );
    if (lastPurchaseOrder && lastPurchaseOrder.poNumber) {
      poNumber = lastPurchaseOrder.poNumber + 1;
    }

    const purchaseOrder = await this.purchaseOrderModel.create({
      ...dto,
      items,
      totalCost,
      tax,
      addedBy: req.user.userId,
      supplierId: req.user.supplierId,
      poNumber,
    });
    this.purchaseOrderHelperService.postPurchaseOrderCreate(purchaseOrder);
    return purchaseOrder;
  }

  async createDraft(
    req: any,
    dto: CreatePurchaseOrderDto,
    i18n: I18nContext,
  ): Promise<PurchaseOrderDocument> {
    const items: any = dto.items;
    let totalCost = 0;
    items.forEach((i) => {
      const itemTaxableAmount = roundOffNumber(i.cost / (1 + Tax.rate / 100));
      i.tax = (itemTaxableAmount * Tax.rate) / 100;
      i.netPrice = itemTaxableAmount;
      i.stockValue = i.stock * i.cost;
      totalCost += i.stockValue;
    });
    const totalTaxableAmount = roundOffNumber(totalCost / (1 + Tax.rate / 100));
    const tax = (totalTaxableAmount * Tax.rate) / 100;
    return await this.purchaseOrderModel.findOneAndUpdate(
      {
        restaurantId: dto.restaurantId,
        vendorId: dto.vendorId,
        status: PurchaseOrderStatus.Draft,
      },
      {
        ...dto,
        items,
        totalCost,
        tax,
        addedBy: req.user.userId,
        supplierId: req.user.supplierId,
        status: PurchaseOrderStatus.Draft,
      },
      { upsert: true, setDefaultsOnInsert: true, new: true },
    );
  }

  async fillToPar(req: any, query: FillToParDto, i18n: I18nContext) {
    const inventory = await this.restaurantMaterialModel.aggregate(
      [
        {
          $match: {
            materialId: new mongoose.Types.ObjectId(query.materialId),
            restaurantId: new mongoose.Types.ObjectId(query.restaurantId),
            supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
          },
        },
        {
          $lookup: {
            from: 'inventories',
            let: {
              restaurantId: '$restaurantId',
              materialId: '$materialId',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$restaurantId', '$$restaurantId'],
                  },
                },
              },
              {
                $match: {
                  $expr: {
                    $eq: ['$materialId', '$$materialId'],
                  },
                },
              },
            ],
            as: 'inventory',
          },
        },
        {
          $lookup: {
            from: 'selectedvendors',
            let: {
              restaurantId: '$restaurantId',
              materialId: '$materialId',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$restaurantId', '$$restaurantId'],
                  },
                },
              },
              {
                $match: {
                  $expr: {
                    $eq: ['$materialId', '$$materialId'],
                  },
                },
              },
              {
                $match: {
                  vendorId: new mongoose.Types.ObjectId(query.vendorId),
                },
              },
            ],
            as: 'selectedVendor',
          },
        },
        {
          $match: {
            selectedVendor: { $ne: [] },
          },
        },
      ],
      { allowDiskUse: true },
    );
    console.log(inventory);

    if (inventory.length == 0) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    const uom = await this.unitOfMeasureModel.findOne(
      {
        _id: inventory[0].selectedVendor[0]?.uom,
      },
      { name: 1, nameAr: 1, _id: 1 },
    );
    const material = await this.materialModel.findOne(
      {
        _id: inventory[0].materialId,
      },
      {
        name: 1,
        nameAr: 1,
        _id: 1,
        description: 1,
        descriptionAr: 1,
        uomBase: 1,
        materialType: 1,
        procurementType: 1,
      },
    );
    let conversionFactor = 1;
    if (
      inventory[0].selectedVendor[0].uom.toString() !=
      material.uomBase.toString()
    ) {
      const convert = await this.unitOfMeasureHelperService.getConversionFactor(
        inventory[0].selectedVendor[0].uom,
        material.uomBase,
      );
      conversionFactor = convert.conversionFactor;
    }
    return {
      cost: inventory[0].selectedVendor[0]?.cost,
      quantity: inventory[0].selectedVendor[0]?.quantity,
      uom: uom,
      poQuantity:
        (inventory[0].parLevel - inventory[0].inventory[0]?.stock) /
        conversionFactor,
    };
  }

  async findAll(
    req: any,
    query: QueryPurchaseOrderDto,
    paginateOptions: PaginationDto,
    status = PurchaseOrderStatus.New,
  ): Promise<PaginateResult<PurchaseOrderDocument>> {
    let queryToApply: any = query;
    if (query.filter) {
      //delete queryToApply.filter;
      const parser = new MongooseQueryParser();
      const parsed = parser.parse(`${query.filter}`);
      queryToApply = { ...queryToApply, ...parsed.filter };
    }

    const records = await this.purchaseOrderModelPag.paginate(
      {
        ...queryToApply,
        supplierId: req.user.supplierId,
        deletedAt: null,
        status,
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

  async sheet(
    req: any,
    query: QueryPurchaseOrderPreviewDto,
    paginateOptions: PaginationDto,
  ): Promise<AggregatePaginateResult<RestaurantDocument>> {
    let queryToApply: any = {};
    if (query.restaurantId) {
      queryToApply.restaurantId = new mongoose.Types.ObjectId(
        query.restaurantId,
      );
    }
    if (query.materialId) {
      queryToApply.materialId = new mongoose.Types.ObjectId(query.materialId);
    }
    let vendorQuery: any = { vendorId: {}, selectedVendor: {} };
    if (query.vendorId) {
      vendorQuery = {
        vendorId: { vendorId: new mongoose.Types.ObjectId(query.vendorId) },
        selectedVendor: {
          selectedVendor: {
            $ne: [],
          },
        },
      };
    }
    const records = await this.restaurantMaterialModel.aggregatePaginate(
      this.restaurantMaterialModel.aggregate(
        [
          {
            $match: {
              ...queryToApply,
              supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
            },
          },
          {
            $lookup: {
              from: 'inventories',
              let: {
                restaurantId: '$restaurantId',
                materialId: '$materialId',
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$restaurantId', '$$restaurantId'],
                    },
                  },
                },
                {
                  $match: {
                    $expr: {
                      $eq: ['$materialId', '$$materialId'],
                    },
                  },
                },
              ],
              as: 'inventory',
            },
          },
          {
            $lookup: {
              from: 'selectedvendors',
              let: {
                restaurantId: '$restaurantId',
                materialId: '$materialId',
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$restaurantId', '$$restaurantId'],
                    },
                  },
                },
                {
                  $match: {
                    $expr: {
                      $eq: ['$materialId', '$$materialId'],
                    },
                  },
                },
                {
                  $match: {
                    isDefault: true,
                    ...vendorQuery.vendorId,
                  },
                },
              ],
              as: 'selectedVendor',
            },
          },
          {
            $match: {
              ...vendorQuery.selectedVendor,
            },
          },
        ],
        { allowDiskUse: true },
      ),
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );
    const docs = records.docs;
    let restaurants = await this.restaurantModel.find(
      {
        _id: { $in: docs.map((d) => d.restaurantId) },
      },
      { name: 1, nameAr: 1, _id: 1 },
    );
    restaurants = restaurants.reduce((acc, d) => {
      acc[d._id.toString()] = d;
      return acc;
    }, []);

    let materials = await this.materialModel.find(
      {
        _id: {
          $in: docs.map((d) => d.materialId),
        },
      },
      {
        name: 1,
        nameAr: 1,
        _id: 1,
        description: 1,
        descriptionAr: 1,
        uomBase: 1,
        materialType: 1,
        procurementType: 1,
      },
    );
    materials = materials.reduce((acc, d) => {
      acc[d._id.toString()] = d;
      return acc;
    }, []);

    let unitOfMeasures = await this.unitOfMeasureModel.find(
      {
        $or: [
          {
            _id: {
              $in: materials.map((m) => m.uomBase),
            },
          },
          {
            _id: {
              $in: docs.map((d) => d.selectedVendor[0]?.uom),
            },
          },
        ],
      },
      { name: 1, nameAr: 1, _id: 1 },
    );

    unitOfMeasures = unitOfMeasures.reduce((acc, d) => {
      acc[d._id.toString()] = d;
      return acc;
    }, []);

    let vendors = await this.vendorModel.find(
      {
        _id: {
          $in: docs.map((d) => {
            console.log(d.selectedVendor[0]?.vendorId);
            return d.selectedVendor[0]?.vendorId;
          }),
        },
      },
      { name: 1, nameAr: 1 },
    );

    vendors = vendors.reduce((acc, d) => {
      acc[d._id.toString()] = d;
      return acc;
    }, []);

    const response = [];
    for (const i in docs) {
      let conversionFactor = 1;
      if (
        docs[i].selectedVendor.length > 0 &&
        docs[i].selectedVendor[0].uom.toString() !=
          materials[docs[i].materialId.toString()].uomBase.toString()
      ) {
        const convert =
          await this.unitOfMeasureHelperService.getConversionFactor(
            docs[i].selectedVendor[0].uom,
            materials[docs[i].materialId.toString()].uomBase,
          );
        conversionFactor = convert.conversionFactor;
      }

      response.push({
        restaurant: restaurants[docs[i].restaurantId.toString()],
        material: materials[docs[i].materialId.toString()],
        materialRestaurant: {
          minStockLevel: docs[i].minStockLevel,
          parLevel: docs[i].parLevel,
          onHand: docs[i].inventory[0]?.stock,
          poQuantityBase: docs[i].parLevel - docs[i].inventory[0]?.stock,
          uomBase:
            unitOfMeasures[
              materials[docs[i].materialId.toString()].uomBase.toString()
            ],
        },
        vendor: vendors[docs[i].selectedVendor[0]?.vendorId.toString()],
        vendorRecord: {
          cost: docs[i].selectedVendor[0]?.cost,
          quantity: docs[i].selectedVendor[0]?.quantity,
          uom: unitOfMeasures[docs[i].selectedVendor[0]?.uom.toString()],
          poQuantity:
            (docs[i].parLevel - docs[i].inventory[0]?.stock) / conversionFactor,
        },
      });
    }
    records.docs = response;

    return records;
  }

  async findOne(
    purchaseOrderId: string,
    i18n: I18nContext,
  ): Promise<PurchaseOrderDocument> {
    const exists = await this.purchaseOrderModel.findById(purchaseOrderId);

    if (!exists) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return exists;
  }

  async approvePreview(req, purchaseOrderId: string, i18n: I18nContext) {
    const purchaseOrder = await this.purchaseOrderModel.findOneAndUpdate(
      { _id: purchaseOrderId, status: PurchaseOrderStatus.Draft },
      { status: PurchaseOrderStatus.New },
      {
        new: true,
      },
    );

    if (!purchaseOrder) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    this.purchaseOrderHelperService.postPurchaseOrderCreate(purchaseOrder);
    return purchaseOrder;
  }

  async confirm(req, purchaseOrderId: string, i18n: I18nContext) {
    const purchaseOrder = await this.purchaseOrderModel.findOneAndUpdate(
      { _id: purchaseOrderId, status: PurchaseOrderStatus.New },
      { status: PurchaseOrderStatus.Confirmed },
      {
        new: true,
      },
    );

    if (!purchaseOrder) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    this.purchaseOrderHelperService.postPurchaseOrderConfirmed(purchaseOrder);
    return purchaseOrder;
  }

  async update(
    req,
    purchaseOrderId: string,
    dto: UpdatePurchaseOrderDto,
    i18n: I18nContext,
  ): Promise<PurchaseOrderDocument> {
    let additionalDetails = {};
    if (dto.items) {
      const material = await this.materialModel.count({
        _id: {
          $in: dto.items.map((i) => {
            return i.materialId;
          }),
        },
        supplierId: req.user.supplierId,
      });
      if (material != dto.items.length) {
        throw new BadRequestException(i18n.t(`SOME_ITEMS_NOT_FOUND`));
      }
      const items: any = dto.items;
      let totalCost = 0;
      items.forEach((i) => {
        const itemTaxableAmount = roundOffNumber(i.cost / (1 + Tax.rate / 100));
        i.tax = (itemTaxableAmount * Tax.rate) / 100;
        i.stockValue = i.stock * i.cost;
        totalCost += i.stockValue;
      });
      const totalTaxableAmount = roundOffNumber(
        totalCost / (1 + Tax.rate / 100),
      );
      const tax = (totalTaxableAmount * Tax.rate) / 100;
      additionalDetails = {
        totalCost,
        tax,
      };
    }
    const purchaseOrder = await this.purchaseOrderModel.findByIdAndUpdate(
      purchaseOrderId,
      { ...dto, ...additionalDetails },
      {
        new: true,
      },
    );

    if (!purchaseOrder) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return purchaseOrder;
  }

  async remove(purchaseOrderId: string, i18n: I18nContext): Promise<boolean> {
    const purchaseOrder = await this.purchaseOrderModel.findByIdAndUpdate(
      purchaseOrderId,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!purchaseOrder) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    return true;
  }
}
