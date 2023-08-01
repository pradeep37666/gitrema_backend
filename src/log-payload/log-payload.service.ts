import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { RequestLog, RequestLogDocument } from './schemas/request-log.schema';

@Injectable()
export class LogPayloadService {
  constructor(
    @InjectModel(RequestLog.name)
    private readonly requestLogModel: Model<RequestLogDocument>,
  ) {}
  async create(req: any, dto: any): Promise<RequestLogDocument> {
    return await this.requestLogModel.create({
      ...dto,
      supplierId: req?.user?.supplierId ?? null,
      user: req?.user?.userId ?? null,
    });
  }
}
