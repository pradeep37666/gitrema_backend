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
import { PaymentGatewayService } from './payment-gateway.service';
import { CreatePaymentGatewayDto } from './dto/create-payment-gateway.dto';
import { UpdatePaymentGatewayDto } from './dto/update-payment-gateway.dto';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { QueryPaymentGatewayDto } from './dto/query-payment-gateway.dto';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { PaymentGatewayDocument } from './schema/payment-gateway.schema';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';

@Controller('payment-gateway')
@ApiTags('Payment Gateway')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class PaymentGatewayController {
  constructor(private readonly paymentGatewayService: PaymentGatewayService) {}

  @Post()
  @PermissionGuard(PermissionSubject.PaymentGateway, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreatePaymentGatewayDto) {
    return await this.paymentGatewayService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.PaymentGateway, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryPaymentGatewayDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<PaymentGatewayDocument>> {
    return await this.paymentGatewayService.findAll(
      req,
      query,
      paginateOptions,
    );
  }

  @Get(':paymentGatewayId')
  @PermissionGuard(PermissionSubject.PaymentGateway, Permission.Common.FETCH)
  async findOne(
    @Param('paymentGatewayId') paymentGatewayId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.paymentGatewayService.findOne(paymentGatewayId, i18n);
  }

  @Patch(':paymentGatewayId')
  @PermissionGuard(PermissionSubject.PaymentGateway, Permission.Common.UPDATE)
  async update(
    @Param('paymentGatewayId') paymentGatewayId: string,
    @Body() dto: UpdatePaymentGatewayDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.paymentGatewayService.update(paymentGatewayId, dto, i18n);
  }

  @Delete(':paymentGatewayId')
  @PermissionGuard(PermissionSubject.PaymentGateway, Permission.Common.DELETE)
  async remove(
    @Param('paymentGatewayId') paymentGatewayId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.paymentGatewayService.remove(paymentGatewayId, i18n);
  }
}
