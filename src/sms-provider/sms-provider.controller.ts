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
import { SmsProviderService } from './sms-provider.service';
import { CreateSmsProviderDto } from './dto/create-sms-provider.dto';
import { UpdateSmsProviderDto } from './dto/update-sms-provider.dto';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { SmsProviderDocument } from './schema/sms-provider.schema';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { BulkSmsDto } from './dto/bulk-sms.dto';

@Controller('sms-provider')
@ApiTags('SMS Provider')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class SmsProviderController {
  constructor(private readonly smsProviderService: SmsProviderService) {}

  @Post()
  @PermissionGuard(PermissionSubject.SmsProvider, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreateSmsProviderDto) {
    return await this.smsProviderService.create(req, dto);
  }

  @Post('bulk-sms')
  @PermissionGuard(PermissionSubject.SmsProvider, Permission.Sms.BulkSend)
  async bulkSms(
    @Req() req,
    @Body() dto: BulkSmsDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.smsProviderService.sendBulkSms(req, dto, i18n);
  }

  @Get()
  @PermissionGuard(PermissionSubject.SmsProvider, Permission.Common.LIST)
  async findAll(
    @Req() req,

    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<SmsProviderDocument>> {
    return await this.smsProviderService.findAll(
      req,

      paginateOptions,
    );
  }

  @Get(':smsProviderId')
  @PermissionGuard(PermissionSubject.SmsProvider, Permission.Common.FETCH)
  async findOne(
    @Param('smsProviderId') smsProviderId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.smsProviderService.findOne(smsProviderId, i18n);
  }

  @Patch(':smsProviderId')
  @PermissionGuard(PermissionSubject.SmsProvider, Permission.Common.UPDATE)
  async update(
    @Param('smsProviderId') smsProviderId: string,
    @Body() dto: UpdateSmsProviderDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.smsProviderService.update(smsProviderId, dto, i18n);
  }

  @Delete(':smsProviderId')
  @PermissionGuard(PermissionSubject.SmsProvider, Permission.Common.DELETE)
  async remove(
    @Param('smsProviderId') smsProviderId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.smsProviderService.remove(smsProviderId, i18n);
  }
}
