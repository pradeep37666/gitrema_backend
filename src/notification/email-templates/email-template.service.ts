import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model, PaginateModel, PaginateResult } from 'mongoose';

import {
  AddEmailTemplateDto,
  EmailTemplateQueryDto,
  UpdateEmailTemplateDto,
} from './email-template.dto';
import {
  EmailTemplate,
  EmailTemplateDocument,
} from './schemas/email-template.schema';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { STATUS_MSG } from 'src/core/Constants/status-message.constants';
@Injectable()
export class EmailTemplateService {
  constructor(
    @InjectModel(EmailTemplate.name)
    private emailTemplateModel: Model<EmailTemplateDocument>,
    @InjectModel(EmailTemplate.name)
    private emailTemplateModelPag: PaginateModel<EmailTemplateDocument>,
  ) {}

  async create(
    req: any,
    emailTemplateDetails: AddEmailTemplateDto,
  ): Promise<EmailTemplateDocument> {
    const template = new this.emailTemplateModel({
      ...emailTemplateDetails,
      supplierId: req.user.supplierId,
    });
    return await template.save();
  }

  async update(
    templateId: string,
    UpdateEmailTemplateDto: UpdateEmailTemplateDto,
  ): Promise<LeanDocument<EmailTemplateDocument>> {
    const existingTemplate = await this.emailTemplateModel
      .findByIdAndUpdate(templateId, UpdateEmailTemplateDto, {
        new: true,
      })
      .lean();

    if (!existingTemplate) {
      throw new NotFoundException(STATUS_MSG.ERROR.RECORD_NOT_FOUND);
    }

    return existingTemplate;
  }

  async all(
    req,
    query: EmailTemplateQueryDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<EmailTemplateDocument>> {
    const emailTemplates = await await this.emailTemplateModelPag.paginate(
      {
        ...query,
        supplierId: req.user.supplierId,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );
    return emailTemplates;
  }

  async fetch(
    templateId: string,
  ): Promise<LeanDocument<EmailTemplateDocument>> {
    const template = await this.emailTemplateModel.findById(templateId).lean();
    if (!template) {
      throw new NotFoundException(STATUS_MSG.ERROR.RECORD_NOT_FOUND);
    }
    return template;
  }

  async delete(
    templateId: string,
  ): Promise<LeanDocument<EmailTemplateDocument>> {
    const deletedTemplate = await this.emailTemplateModel.findByIdAndDelete(
      templateId,
    );
    if (!deletedTemplate) {
      throw new NotFoundException(STATUS_MSG.ERROR.RECORD_NOT_FOUND);
    }
    return deletedTemplate;
  }
}
