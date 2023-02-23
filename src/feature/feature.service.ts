import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Feature, FeatureDocument } from './schemas/feature.schema';

@Injectable()
export class FeatureService {
  constructor(
    @InjectModel(Feature.name)
    private readonly featureModel: Model<FeatureDocument>,
    @InjectModel(Feature.name)
    private readonly featureModelPag: PaginateModel<FeatureDocument>,
  ) {}

  async create(req: any, dto: CreateFeatureDto): Promise<FeatureDocument> {
    return await this.featureModel.create({
      ...dto,

      addedBy: req.user.userId,
    });
  }

  async findAll(
    req: any,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<FeatureDocument>> {
    const features = await this.featureModelPag.paginate(
      {},
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );
    return features;
  }

  async findOne(featureId: string): Promise<FeatureDocument> {
    const exists = await this.featureModel.findById(featureId);

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async update(
    featureId: string,
    dto: UpdateFeatureDto,
  ): Promise<FeatureDocument> {
    const feature = await this.featureModel.findByIdAndUpdate(featureId, dto, {
      new: true,
    });

    if (!feature) {
      throw new NotFoundException();
    }

    return feature;
  }

  async remove(featureId: string): Promise<boolean> {
    const feature = await this.featureModel.findByIdAndRemove(featureId);

    if (!feature) {
      throw new NotFoundException();
    }
    return true;
  }
}
