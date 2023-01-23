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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaginateResult } from 'mongoose';
import { Permission } from 'src/core/Constants/permission.type';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { TransactionService } from './transaction.service';
import { TransactionQueryDto } from './transaction.dto';
import { PaginationDto } from 'src/core/Constants/pagination';
import { TransactionDocument } from './schemas/transactions.schema';
import { SkipInterceptor } from 'src/core/decorators/skip-interceptor.decorator';

@ApiTags('Transactions')
@ApiBearerAuth('access-token')
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @PermissionGuard(PermissionSubject.Transaction, Permission.Common.LIST)
  async all(
    @Request() req,
    @Query() query: TransactionQueryDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<TransactionDocument>> {
    return await this.transactionService.all(req, query, paginateOptions);
  }

  // @Get('export')
  // @Header('Content-Type', 'application/xlsx')
  // @Header('Content-Disposition', 'attachment; filename="transactions.xlsx"')
  // @SkipInterceptor()
  // @PermissionGuard(PermissionSubject.Transaction, Permission.Common.LIST)
  // async export(
  //   @Request() req,
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
  //   @Request() req,
  //   @Query() query: TransactionQueryDto,
  //   @Res({ passthrough: true }) res: Response,
  // ): Promise<any> {
  //   const file = await this.transactionService.exportRemittance(req, query);

  //   return new StreamableFile(file);
  // }
}
