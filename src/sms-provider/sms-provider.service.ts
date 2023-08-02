import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSmsProviderDto } from './dto/create-sms-provider.dto';
import { UpdateSmsProviderDto } from './dto/update-sms-provider.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SmsProvider, SmsProviderDocument } from './schema/sms-provider.schema';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { I18nContext } from 'nestjs-i18n';
import { BulkSmsDto } from './dto/bulk-sms.dto';
import { Provider } from './enum/en';
import { TaqnyatService } from 'src/core/Providers/Sms/taqnyat.service';
import { AsmscService } from 'src/core/Providers/Sms/asmsc-sms.service';

@Injectable()
export class SmsProviderService {
  constructor(
    @InjectModel(SmsProvider.name)
    private readonly smsProviderModel: Model<SmsProviderDocument>,
    @InjectModel(SmsProvider.name)
    private readonly smsProviderModelPag: PaginateModel<SmsProviderDocument>,
    private readonly taqnyatService: TaqnyatService,
    private readonly asmscService: AsmscService,
  ) {}

  async create(
    req: any,
    dto: CreateSmsProviderDto,
  ): Promise<SmsProviderDocument> {
    return await this.smsProviderModel.findOneAndUpdate(
      {
        supplierId: dto.supplierId,
      },
      {
        ...dto,

        addedBy: req.user.userId,
      },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  async findAll(
    req: any,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<SmsProviderDocument>> {
    const queryToApply: any = {};
    if (req.user.supplierId) {
      queryToApply.supplierId = req.user.supplierId;
    }

    const records = await this.smsProviderModelPag.paginate(
      {
        ...queryToApply,
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
    paymentGatewayId: string,
    i18n: I18nContext,
  ): Promise<SmsProviderDocument> {
    const exists = await this.smsProviderModel.findById(paymentGatewayId);

    if (!exists) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return exists;
  }

  async findOneBySupplier(supplierId: string): Promise<SmsProviderDocument> {
    const exists = await this.smsProviderModel.findOne({ supplierId });

    return exists;
  }

  async update(
    paymentGatewayId: string,
    dto: UpdateSmsProviderDto,
    i18n: I18nContext,
  ): Promise<SmsProviderDocument> {
    const paymentGateway = await this.smsProviderModel.findByIdAndUpdate(
      paymentGatewayId,
      dto,
      {
        new: true,
      },
    );

    if (!paymentGateway) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return paymentGateway;
  }

  async remove(paymentGatewayId: string, i18n: I18nContext): Promise<boolean> {
    const paymentGateway = await this.smsProviderModel.findByIdAndRemove(
      paymentGatewayId,
    );

    if (!paymentGateway) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    return true;
  }

  async sendBulkSms(req, dto: BulkSmsDto, i18n: I18nContext) {
    const smsProvider = await this.smsProviderModel.findOne({
      supplierId: req.user.supplierId,
    });
    if (!smsProvider) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    for (const i in dto.phoneNumbers) {
      if (smsProvider.provider == Provider.Asmsc) {
        this.asmscService.sendPromotionalMessage(
          dto.phoneNumbers[i],
          dto.message,
          smsProvider.credentials,
        );
      } else if (smsProvider.provider == Provider.Taqnyat) {
        this.taqnyatService.send(
          dto.phoneNumbers[i],
          dto.message,
          smsProvider.credentials,
        );
      }
    }
  }
}
