import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  GlobalConfig,
  GlobalConfigDocument,
} from './schema/global-config.schema';
import { Model } from 'mongoose';
import { CreateGlobalConfigDto } from './dto/create-global-config.dto';

@Injectable()
export class GlobalConfigService {
  constructor(
    @InjectModel(GlobalConfig.name)
    private readonly globalConfigModel: Model<GlobalConfigDocument>,
  ) {}
  async create(
    req: any,
    dto: CreateGlobalConfigDto,
  ): Promise<GlobalConfigDocument> {
    return await this.globalConfigModel.findOneAndUpdate(
      {},
      {
        ...dto,
      },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  async fetch(): Promise<GlobalConfigDocument> {
    const exists = await this.globalConfigModel.findOne({});

    return exists;
  }
}
