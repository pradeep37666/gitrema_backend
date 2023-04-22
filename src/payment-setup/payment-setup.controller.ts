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
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { CreatePaymentSetupDto } from './dto/create-payment-setup.dto';
import { UpdatePaymentSetupDto } from './dto/update-payment-setup.dto';
import { PaymentSetupService } from './payment-setup.service';
import { PaymentSetupDocument } from './schemas/payment-setup.schema';
import { QueryPaymentSetupDto } from './dto/query-payment-setup.dto';

@Controller('payment-setup')
@ApiTags('Payment Setup')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class PaymentSetupController {
  constructor(private readonly paymentSetupService: PaymentSetupService) {}

  @Post()
  @PermissionGuard(PermissionSubject.PaymentSetup, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreatePaymentSetupDto) {
    return await this.paymentSetupService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.PaymentSetup, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryPaymentSetupDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<PaymentSetupDocument>> {
    return await this.paymentSetupService.findAll(req, query, paginateOptions);
  }

  @Get(':paymentSetupId')
  @PermissionGuard(PermissionSubject.PaymentSetup, Permission.Common.FETCH)
  async findOne(@Param('paymentSetupId') paymentSetupId: string) {
    return await this.paymentSetupService.findOne(paymentSetupId);
  }

  @Patch(':paymentSetupId')
  @PermissionGuard(PermissionSubject.PaymentSetup, Permission.Common.UPDATE)
  async update(
    @Param('paymentSetupId') paymentSetupId: string,
    @Body() dto: UpdatePaymentSetupDto,
  ) {
    return await this.paymentSetupService.update(paymentSetupId, dto);
  }

  @Delete(':paymentSetupId')
  @PermissionGuard(PermissionSubject.PaymentSetup, Permission.Common.DELETE)
  async remove(@Param('paymentSetupId') paymentSetupId: string) {
    return await this.paymentSetupService.remove(paymentSetupId);
  }
}
