import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Recipe, RecipeDocument } from './schema/recipe.schema';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { QueryRecipeDto } from './dto/query-recipe.dto';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { MongooseQueryParser } from 'mongoose-query-parser';
import { I18nContext } from 'nestjs-i18n';
import {
  Inventory,
  InventoryDocument,
} from 'src/inventory/schemas/inventory.schema';
import { UnitOfMeasureHelperService } from 'src/unit-of-measure/unit-of-measure-helper.service';
import { RecipePricePreviewDto } from './dto/recipe-price-preview.dto';
import {
  Material,
  MaterialDocument,
} from 'src/material/schemas/material.schema';
import {
  UnitOfMeasure,
  UnitOfMeasureDocument,
} from 'src/unit-of-measure/schemas/unit-of-measure.schema';

@Injectable()
export class RecipeService {
  constructor(
    @InjectModel(Recipe.name)
    private readonly recipeModel: Model<RecipeDocument>,
    @InjectModel(Recipe.name)
    private readonly recipeModelPag: PaginateModel<RecipeDocument>,
    @InjectModel(Inventory.name)
    private readonly inventoryModel: Model<InventoryDocument>,
    @InjectModel(Material.name)
    private readonly materialModel: Model<MaterialDocument>,
    @InjectModel(UnitOfMeasure.name)
    private readonly unitOfMeasureModel: Model<UnitOfMeasureDocument>,
    private readonly unitOfMeasureHelperService: UnitOfMeasureHelperService,
  ) {}

  async create(req: any, dto: CreateRecipeDto): Promise<RecipeDocument> {
    let materials = await this.materialModel
      .find({
        _id: {
          $in: dto.components.map((c) => {
            return c.materialId;
          }),
        },
      })
      .populate([
        {
          path: 'uomBase',
          populate: {
            path: 'baseUnit',
            populate: {
              path: 'baseUnit',
            },
          },
        },
      ]);

    let uoms = await this.unitOfMeasureModel
      .find({
        _id: {
          $in: dto.components.map((c) => {
            return c.uom;
          }),
        },
      })
      .populate([
        {
          path: 'baseUnit',
          populate: {
            path: 'baseUnit',
          },
        },
      ]);
    materials = materials.reduce((acc, d) => {
      acc[d._id.toString()] = d;
      return acc;
    }, []);

    uoms = uoms.reduce((acc, d) => {
      acc[d._id.toString()] = d;
      return acc;
    }, []);
    for (const i in dto.components) {
      let materialUomMeasure = null;
      let refMaterialUom = materials[dto.components[i].materialId].uomBase;
      while (refMaterialUom) {
        materialUomMeasure = refMaterialUom.measure ?? null;
        if (refMaterialUom.baseUnit) {
          refMaterialUom = refMaterialUom.baseUnit;
        } else {
          refMaterialUom = null;
        }
      }
      let uomMeasure = null;
      let refUom = uoms[dto.components[i].uom];
      while (refUom) {
        uomMeasure = refUom.measure ?? null;
        if (refUom.baseUnit) {
          refUom = refUom.baseUnit;
        } else {
          refUom = null;
        }
      }
      if (materialUomMeasure != uomMeasure) {
        throw new BadRequestException(
          `Material ${dto.components[i].materialId} needs ${materialUomMeasure} type of UOM`,
        );
      }
    }
    return await this.recipeModel.create({
      ...dto,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });
  }

  async previewPrice(query: RecipePricePreviewDto): Promise<any> {
    const orQuery = {
      $or: [
        {
          _id: query.recipeId,
        },
        {
          masterMaterialId: query.materialId,
        },
      ],
    };
    const recipe = await this.recipeModel.findOne(orQuery).lean();

    if (!recipe) return 0;

    const inventories = await this.inventoryModel.find({
      restaurantId: query.restaurantId,
      materialId: {
        $in: recipe.components.map((c) => {
          return c.materialId;
        }),
      },
    });

    let totalCost = 0;
    const items = [];
    for (const i in inventories) {
      const component = recipe.components.find((c) => {
        return c.materialId.toString() == inventories[i].materialId.toString();
      });
      if (component) {
        let conversionFactor = 1;
        if (component.uom.toString() != inventories[i].uomBase.toString()) {
          const convert =
            await this.unitOfMeasureHelperService.getConversionFactor(
              component.uom,
              inventories[i].uomBase,
            );
          conversionFactor = convert.conversionFactor;
        }
        const item = {
          ...component,
          uomBase: inventories[i].uomBase,
          baseUnitCost: inventories[i].averageCost,
          baseTotalCost:
            component.stock * conversionFactor * inventories[i].averageCost,
        };
        items.push(item);
        totalCost += item.baseTotalCost;
      }
    }
    return { items, totalCost };
  }

  async findAll(
    req: any,
    query: QueryRecipeDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<RecipeDocument>> {
    let queryToApply: any = query;
    if (query.filter) {
      //delete queryToApply.filter;
      const parser = new MongooseQueryParser();
      const parsed = parser.parse(`${query.filter}`);
      queryToApply = { ...queryToApply, ...parsed.filter };
    }
    const recipes = await this.recipeModelPag.paginate(
      {
        ...queryToApply,
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
    return recipes;
  }

  async findOne(recipeId: string, i18n: I18nContext): Promise<RecipeDocument> {
    const exists = await this.recipeModel.findById(recipeId);

    if (!exists) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return exists;
  }

  async update(
    recipeId: string,
    dto: UpdateRecipeDto,
    i18n: I18nContext,
  ): Promise<RecipeDocument> {
    const recipe = await this.recipeModel.findByIdAndUpdate(recipeId, dto, {
      new: true,
    });

    if (!recipe) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return recipe;
  }

  async remove(recipeId: string, i18n: I18nContext): Promise<boolean> {
    const recipe = await this.recipeModel.findByIdAndUpdate(
      recipeId,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!recipe) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    return true;
  }
}
