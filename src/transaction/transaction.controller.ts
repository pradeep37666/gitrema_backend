import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Param,
  Put,
  Delete,
  InternalServerErrorException,
  NotFoundException,
  Query,
  Header,
  Res,
  StreamableFile,
  Response,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PaginateResult } from 'mongoose';
import { Permission } from 'src/core/Constants/permission.type';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { TransactionService } from './transaction.service';
import { TransactionQueryDto } from './transaction.dto';
import { PaginationDto } from 'src/core/Constants/pagination';
import { TransactionDocument } from './schemas/transactions.schema';
import { SkipInterceptor } from 'src/core/decorators/skip-interceptor.decorator';
import { ChangeTransactionPaymentMethodDto } from './dto/change-payment-method.dto';

@ApiTags('Transactions')
@ApiBearerAuth('access-token')
@Controller('transactions')
@ApiHeader({ name: 'lang' })
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @PermissionGuard(PermissionSubject.Transaction, Permission.Common.LIST)
  async all(
    @Req() req,
    @Query() query: TransactionQueryDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<TransactionDocument>> {
    return await this.transactionService.all(req, query, paginateOptions);
  }

  @Get(':transactionId')
  @PermissionGuard(PermissionSubject.Transaction, Permission.Common.FETCH)
  async findOne(@Param('transactionId') transactionId: string) {
    return await this.transactionService.get(transactionId);
  }

  @Post('change-payment-method')
  @PermissionGuard(PermissionSubject.Transaction, Permission.Common.UPDATE)
  async changePaymentMethod(
    @Req() req,
    @Body() dto: ChangeTransactionPaymentMethodDto,
  ) {
    return await this.transactionService.changePaymentMethod(req, dto);
  }

  // @Get('export')
  // @Header('Content-Type', 'application/xlsx')
  // @Header('Content-Disposition', 'attachment; filename="transactions.xlsx"')
  // @SkipInterceptor()
  // @PermissionGuard(PermissionSubject.Transaction, Permission.Common.LIST)
  // async export(
  //   @Req() req,
  //   @Query() query: TransactionQueryDto,
  //   @Res({ passthrough: true }) res: Response,
  // ): Promise<any> {
  //   const file = await this.transactionService.export(req, query);

  //   return new StreamableFile(file);
  // }

  // @Get('export-remittance')
  // @Header('Content-Type', 'application/xlsx')
  // @Header('Content-Disposition', 'attachment; filename="remittance.xlsx"')
  // @SkipInterceptor()
  // @PermissionGuard(PermissionSubject.Transaction, Permission.Common.LIST)
  // async remittance(
  //   @Req() req,
  //   @Query() query: TransactionQueryDto,
  //   @Res({ passthrough: true }) res: Response,
  // ): Promise<any> {
  //   const file = await this.transactionService.exportRemittance(req, query);

  //   return new StreamableFile(file);
  // }
}
