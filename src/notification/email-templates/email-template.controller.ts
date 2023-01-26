import {
  Body,
  Controller,
  Request,
  Delete,
  Get,
  Param,
  Post,
  Put,
  InternalServerErrorException,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LeanDocument, PaginateResult } from 'mongoose';

import {
  AddEmailTemplateDto,
  EmailTemplateQueryDto,
  UpdateEmailTemplateDto,
} from './email-template.dto';
import { EmailTemplateService } from './email-template.service';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { EmailTemplateDocument } from './schemas/email-template.schema';
import { PaginationDto } from 'src/core/Constants/pagination';
import { CustomFields } from 'src/core/Constants/custom-fields.constant';
import { STATUS_MSG } from 'src/core/Constants/status-message.constants';

@ApiTags('Email Templates')
@ApiBearerAuth('access-token')
@Controller('email-templates')
export class EmailTemplateController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  @Post()
  @PermissionGuard(PermissionSubject.EmailTemplate, Permission.Common.CREATE)
  async create(
    @Req() req,
    @Body() addEmailTemplateDto: AddEmailTemplateDto,
  ): Promise<EmailTemplateDocument> {
    return await this.emailTemplateService.create(req, addEmailTemplateDto);
  }

  @Put(':templateId')
  @PermissionGuard(PermissionSubject.EmailTemplate, Permission.Common.UPDATE)
  async update(
    @Param('templateId') templateId: string,
    @Body() updateEmailTemplateDto: UpdateEmailTemplateDto,
  ): Promise<LeanDocument<EmailTemplateDocument>> {
    return await this.emailTemplateService.update(
      templateId,
      updateEmailTemplateDto,
    );
  }

  @Get()
  @PermissionGuard(PermissionSubject.EmailTemplate, Permission.Common.LIST)
  async all(
    @Req() req,
    @Query() query: EmailTemplateQueryDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<EmailTemplateDocument>> {
    return await this.emailTemplateService.all(req, query, paginateOptions);
  }

  @Get(':templateId')
  @PermissionGuard(PermissionSubject.EmailTemplate, Permission.Common.FETCH)
  async fetch(
    @Param('templateId') templateId: string,
  ): Promise<LeanDocument<EmailTemplateDocument>> {
    return await this.emailTemplateService.fetch(templateId);
  }

  @Get('custom-fields')
  @PermissionGuard(PermissionSubject.CustomFields, Permission.Common.FETCH)
  async fetchCustomFields(): Promise<CustomFields[]> {
    return Object.values(CustomFields);
  }

  @Delete(':templateId')
  @PermissionGuard(PermissionSubject.EmailTemplate, Permission.Common.DELETE)
  async delete(@Param('templateId') templateId: string): Promise<any> {
    const deleted = await this.emailTemplateService.delete(templateId);
    if (deleted) {
      return STATUS_MSG.SUCCESS.DELETED;
    }
    throw new InternalServerErrorException(STATUS_MSG.ERROR.SERVER_ERROR);
  }
}
