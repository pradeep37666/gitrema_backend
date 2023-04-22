import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
  Req,
} from '@nestjs/common';
import { FeatureService } from './feature.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PaginationDto } from 'src/core/Constants/pagination';
import { FeatureDocument } from './schemas/feature.schema';
import { PaginateResult } from 'mongoose';

@Controller('feature')
@ApiTags('Features')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Post()
  @PermissionGuard(PermissionSubject.Feature, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreateFeatureDto) {
    return await this.featureService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.Feature, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<FeatureDocument>> {
    return await this.featureService.findAll(req, paginateOptions);
  }

  @Get(':featureId')
  @PermissionGuard(PermissionSubject.Feature, Permission.Common.FETCH)
  async findOne(@Param('featureId') featureId: string) {
    return await this.featureService.findOne(featureId);
  }

  @Patch(':featureId')
  @PermissionGuard(PermissionSubject.Feature, Permission.Common.UPDATE)
  async update(
    @Param('featureId') featureId: string,
    @Body() dto: UpdateFeatureDto,
  ) {
    return await this.featureService.update(featureId, dto);
  }

  @Delete(':featureId')
  @PermissionGuard(PermissionSubject.Feature, Permission.Common.DELETE)
  async remove(@Param('featureId') featureId: string) {
    return await this.featureService.remove(featureId);
  }
}
