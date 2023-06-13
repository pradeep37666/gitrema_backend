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
import { PrinterService } from './printer.service';
import { CreatePrinterDto } from './dto/create-printer.dto';
import { UpdatePrinterDto } from './dto/update-printer.dto';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { Permission } from 'src/core/Constants/permission.type';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { PaginateResult } from 'mongoose';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PrinterDocument } from './schema/printer.schema';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/core/decorators/public.decorator';

@Controller('printer')
@ApiTags('Printers')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class PrinterController {
  constructor(private readonly printerService: PrinterService) {}

  @Post()
  @PermissionGuard(PermissionSubject.Printer, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreatePrinterDto) {
    return await this.printerService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.Printer, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<PrinterDocument>> {
    return await this.printerService.findAll(req, paginateOptions);
  }

  @Get('fetch-by-supplier/:supplierId')
  @Public()
  async fetchBySupplier(
    @Param('supplierId') supplierId: string,
  ): Promise<PrinterDocument[]> {
    return await this.printerService.fetchBySupplier(supplierId);
  }

  @Get(':printerId')
  @PermissionGuard(PermissionSubject.Printer, Permission.Common.FETCH)
  async findOne(
    @Param('printerId') printerId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.printerService.findOne(printerId, i18n);
  }

  @Patch(':printerId')
  @PermissionGuard(PermissionSubject.Printer, Permission.Common.UPDATE)
  async update(
    @Param('printerId') printerId: string,
    @Body() dto: UpdatePrinterDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.printerService.update(printerId, dto, i18n);
  }

  @Delete(':printerId')
  @PermissionGuard(PermissionSubject.Printer, Permission.Common.DELETE)
  async remove(
    @Param('printerId') printerId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.printerService.remove(printerId, i18n);
  }
}
