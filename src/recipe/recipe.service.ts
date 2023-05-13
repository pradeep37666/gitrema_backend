import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class RecipeService {
  constructor(
    @InjectModel(Recipe.name)
    private readonly recipeModel: Model<RecipeDocument>,
    @InjectModel(Recipe.name)
    private readonly recipeModelPag: PaginateModel<RecipeDocument>,
    @InjectModel(Inventory.name)
    private readonly inventoryModel: Model<InventoryDocument>,

    private readonly unitOfMeasureHelperService: UnitOfMeasureHelperService,
  ) {}

  async create(req: any, dto: CreateRecipeDto): Promise<RecipeDocument> {
    return await this.recipeModel.create({
      ...dto,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });
  }

  async previewPrice(query: RecipePricePreviewDto): Promise<number> {
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
    const recipe = await this.recipeModel.findOne(orQuery);

    if (!recipe) return 0;

    const inventories = await this.inventoryModel.find({
      restaurantId: query.restaurantId,
      materialId: {
        $in: recipe.components.map((c) => {
          return c.materialId;
        }),
      },
    });

    let cost = 0;
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
        cost += component.stock * conversionFactor * inventories[i].averageCost;
      }
    }
    return cost;
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
