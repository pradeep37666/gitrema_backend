import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import {
  UpdateInventoryDto,
  UpdateInventoryIdentifierDto,
} from './dto/update-inventory.dto';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { Inventory, InventoryDocument } from './schemas/inventory.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { QueryInventoryDto } from './dto/query-inventory.dto';
import { MongooseQueryParser } from 'mongoose-query-parser';
import { I18n, I18nContext } from 'nestjs-i18n';
import {
  Material,
  MaterialDocument,
} from 'src/material/schemas/material.schema';
import { UnitOfMeasureHelperService } from 'src/unit-of-measure/unit-of-measure-helper.service';
import { InventoryHelperService } from './inventory-helper.service';
import { InventoryAction } from './enum/en';
import { QueryInventoryHistoryDto } from './dto/query-inventory-history.dto';
import {
  InventoryHistory,
  InventoryHistoryDocument,
} from './schemas/inventory-history.schema';
import { TransferInventoryDto } from './dto/transfer-inventory.dto';
import {
  LowInventory,
  LowInventoryDocument,
} from './schemas/low-inventory.schema';
import {
  InventoryTransfer,
  InventoryTransferDocument,
} from './schemas/inventory-transfer.schema';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name)
    private readonly inventoryModel: Model<InventoryDocument>,
    @InjectModel(Inventory.name)
    private readonly inventoryModelPag: PaginateModel<InventoryDocument>,
    @InjectModel(InventoryHistory.name)
    private readonly inventoryHistoryModelPag: PaginateModel<InventoryHistoryDocument>,
    @InjectModel(LowInventory.name)
    private readonly lowInventoryModelPag: PaginateModel<LowInventoryDocument>,
    @InjectModel(Material.name)
    private readonly materialModel: Model<MaterialDocument>,
    @InjectModel(InventoryTransfer.name)
    private readonly inventoryTransferModel: Model<InventoryTransferDocument>,
    @InjectModel(InventoryTransfer.name)
    private readonly inventoryTransferModelPag: PaginateModel<InventoryTransferDocument>,
    @Inject(forwardRef(() => InventoryHelperService))
    private readonly inventoryHelperService: InventoryHelperService,
    @Inject(forwardRef(() => UnitOfMeasureHelperService))
    private readonly unitOfMeasureHelperService: UnitOfMeasureHelperService,
  ) {}

  async create(req: any, dto: CreateInventoryDto): Promise<InventoryDocument> {
    const material = await this.materialModel.findById(dto.materialId);

    if (!material) {
      throw new NotFoundException('error.NOT_FOUND');
    }
    let inventory: InventoryDocument = await this.inventoryModel.create({
      ...dto,
      stockValue: 0,
      stock: 0,
      averageCost: 0,
      addedBy: req.user.userId,
      supplierId: req.user.supplierId,
      uomBase: material.uomBase,
      uomInventory: material.uomInventory,
    });
    inventory.materialId = material;

    return inventory;
  }

  async findAll(
    req: any,
    query: QueryInventoryDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<InventoryDocument>> {
    let queryToApply: any = query;
    if (query.filter) {
      //delete queryToApply.filter;
      const parser = new MongooseQueryParser();
      const parsed = parser.parse(`${query.filter}`);
      queryToApply = { ...queryToApply, ...parsed.filter };
    }
    const inventories = await this.inventoryModelPag.paginate(
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
    const response = [];
    for (const i in inventories.docs) {
      const docObject: any = inventories.docs[i];
      docObject.convertedUomInventory = [];
      const uomBase = docObject.uomBase;

      for (const j in docObject.uomInventory) {
        const convert =
          await this.unitOfMeasureHelperService.getConversionFactor(
            uomBase,
            docObject.uomInventory[j],
          );

        docObject.convertedUomInventory[j] = {
          uom: convert.targetUom,
          stock: docObject.stock * convert.conversionFactor,
          averageCost: docObject.averageCost / convert.conversionFactor,
          stockValue: docObject.stockValue,
        };
        docObject.uomBase = convert.sourceUom;
      }
      response.push(docObject);
    }
    inventories.docs = response;
    return inventories;
  }

  async fetchHistory(
    req: any,
    query: QueryInventoryHistoryDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<InventoryHistoryDocument>> {
    let queryToApply: any = query;
    if (query.filter) {
      //delete queryToApply.filter;
      const parser = new MongooseQueryParser();
      const parsed = parser.parse(`${query.filter}`);
      queryToApply = { ...queryToApply, ...parsed.filter };
    }
    const records = await this.inventoryHistoryModelPag.paginate(
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

  async fetchLowInventory(
    req: any,
    query: QueryInventoryHistoryDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<LowInventoryDocument>> {
    let queryToApply: any = query;
    if (query.filter) {
      //delete queryToApply.filter;
      const parser = new MongooseQueryParser();
      const parsed = parser.parse(`${query.filter}`);
      queryToApply = { ...queryToApply, ...parsed.filter };
    }
    const records = await this.lowInventoryModelPag.paginate(
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

  async transferInventory(req, dto: TransferInventoryDto, i18n: I18nContext) {
    const inventory = await this.inventoryModel
      .findOne({
        restaurantId: dto.sourceRestaurantId,
        materialId: dto.materialId,
      })
      .populate([{ path: 'materialId' }]);
    if (!inventory) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    const convert = await this.unitOfMeasureHelperService.getConversionFactor(
      inventory.uomBase,
      dto.uom,
    );
    if (convert.conversionFactor * inventory.stock < dto.stock) {
      throw new NotFoundException(`Not enough stock to transfer`);
    }
    const totalTargetStock = dto.target.reduce((acc, d) => {
      return acc + d.stock;
    }, 0);
    if (dto.stock != totalTargetStock) {
      throw new NotFoundException(`Total target stock must be ${dto.stock}`);
    }
    const inventoryTransfer = await this.inventoryTransferModel.create({
      ...dto,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });
    if (inventoryTransfer) {
      await this.inventoryHelperService.applyTransferRequest(
        req,
        inventory,
        inventoryTransfer,
      );
    }
    return inventoryTransfer;
  }

  async fetchTransfers(
    req: any,
    query: QueryInventoryHistoryDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<InventoryTransferDocument>> {
    let queryToApply: any = query;
    if (query.filter) {
      //delete queryToApply.filter;
      const parser = new MongooseQueryParser();
      const parsed = parser.parse(`${query.filter}`);
      queryToApply = { ...queryToApply, ...parsed.filter };
    }
    const records = await this.inventoryTransferModelPag.paginate(
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
    inventoryId: string,
    i18n: I18nContext,
  ): Promise<InventoryDocument> {
    const exists = await this.inventoryModel.findById(inventoryId);

    if (!exists) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    const response: any = exists.toObject();
    response.convertedUomInventory = [];
    for (const i in exists.uomInventory) {
      const convert = await this.unitOfMeasureHelperService.getConversionFactor(
        exists.uomBase,
        exists.uomInventory[i],
      );
      console.log(convert);
      response.convertedUomInventory[i] = {
        uom: convert.targetUom,
        stock: exists.stock * convert.conversionFactor,
        averageCost: exists.averageCost / convert.conversionFactor,
        stockValue: exists.stockValue,
      };
      response.uomBase = convert.sourceUom;
    }

    return response;
  }

  async update(
    identifier: UpdateInventoryIdentifierDto,
    dto: UpdateInventoryDto,
    i18n: I18nContext,
  ): Promise<InventoryDocument> {
    let inventory: InventoryDocument = await this.inventoryModel
      .findOne({
        ...identifier,
      })
      .populate([{ path: 'materialId' }]);

    if (!inventory) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    const calculatedInventory =
      await this.inventoryHelperService.calculateInventoryItem(
        inventory,
        {
          stock: dto.stock ?? null,
          cost: dto.averageCost ?? null,
          uom: dto.uom,
        },
        InventoryAction.ManualCount,
      );

    inventory = await this.inventoryHelperService.saveInventory(
      inventory,
      calculatedInventory,
      InventoryAction.InventoryCount,
      null,
    );
    this.inventoryHelperService.applyToMenuItem(inventory);

    return inventory;
  }

  async remove(inventoryId: string, i18n: I18nContext): Promise<boolean> {
    const inventory = await this.inventoryModel.findByIdAndDelete(inventoryId);

    if (!inventory) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    return true;
  }
}
