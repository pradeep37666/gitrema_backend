import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { QueryRecipeDto } from './dto/query-recipe.dto';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Permission } from 'src/core/Constants/permission.type';

import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { RecipeDocument } from './schema/recipe.schema';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { RecipePricePreviewDto } from './dto/recipe-price-preview.dto';

@Controller('recipe')
@ApiTags('Recipe')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post()
  @PermissionGuard(PermissionSubject.Recipe, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreateRecipeDto) {
    return await this.recipeService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.Recipe, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryRecipeDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<RecipeDocument>> {
    return await this.recipeService.findAll(req, query, paginateOptions);
  }

  @Get('preview-price')
  @PermissionGuard(PermissionSubject.Recipe, Permission.Common.FETCH)
  async previewPrice(@Query() query: RecipePricePreviewDto): Promise<any> {
    return await this.recipeService.previewPrice(query);
  }

  @Get(':recipeId')
  @PermissionGuard(PermissionSubject.Recipe, Permission.Common.FETCH)
  async findOne(
    @Param('recipeId') recipeId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.recipeService.findOne(recipeId, i18n);
  }

  @Patch(':recipeId')
  @PermissionGuard(PermissionSubject.Recipe, Permission.Common.UPDATE)
  async update(
    @Param('recipeId') recipeId: string,
    @Body() dto: UpdateRecipeDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.recipeService.update(recipeId, dto, i18n);
  }

  @Delete(':recipeId')
  @PermissionGuard(PermissionSubject.Recipe, Permission.Common.DELETE)
  async remove(@Param('recipeId') recipeId: string, @I18n() i18n: I18nContext) {
    return await this.recipeService.remove(recipeId, i18n);
  }
}
