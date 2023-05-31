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
import { CustomerConditionService } from './customer-condition.service';
import { CreateCustomerConditionDto } from './dto/create-customer-condition.dto';
import { UpdateCustomerConditionDto } from './dto/update-customer-condition.dto';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { I18n, I18nContext } from 'nestjs-i18n';
import { QueryCustomerConditionDto } from './dto/query-customer-condition.dto';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { CustomerConditionDocument } from './schema/customer-condition.schema';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';

@Controller('customer-condition')
@ApiTags('Customer Condition')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class CustomerConditionController {
  constructor(
    private readonly customerConditionService: CustomerConditionService,
  ) {}

  @Post()
  @PermissionGuard(
    PermissionSubject.CustomerCondition,
    Permission.Common.CREATE,
  )
  async create(
    @Req() req,
    @Body() dto: CreateCustomerConditionDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.customerConditionService.create(req, dto, i18n);
  }

  @Get()
  @PermissionGuard(PermissionSubject.CustomerCondition, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryCustomerConditionDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<CustomerConditionDocument>> {
    return await this.customerConditionService.findAll(
      req,
      query,
      paginateOptions,
    );
  }

  @Get(':customerConditionId')
  @PermissionGuard(PermissionSubject.CustomerCondition, Permission.Common.FETCH)
  async findOne(
    @Param('customerConditionId') customerConditionId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.customerConditionService.findOne(
      customerConditionId,
      i18n,
    );
  }

  @Patch(':customerConditionId')
  @PermissionGuard(
    PermissionSubject.CustomerCondition,
    Permission.Common.UPDATE,
  )
  async update(
    @Req() req,
    @Param('customerConditionId') customerConditionId: string,
    @Body() dto: UpdateCustomerConditionDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.customerConditionService.update(
      req,
      customerConditionId,
      dto,
      i18n,
    );
  }

  @Delete(':customerConditionId')
  @PermissionGuard(
    PermissionSubject.CustomerCondition,
    Permission.Common.DELETE,
  )
  async remove(
    @Param('customerConditionId') customerConditionId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.customerConditionService.remove(
      customerConditionId,
      i18n,
    );
  }
}
