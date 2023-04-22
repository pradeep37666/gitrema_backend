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
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { UpdateQrCodeDto } from './dto/update-qr-code.dto';
import { QrCodeService } from './qr-code.service';
import { QrCodeDocument } from './schemas/qr-code.schema';

@Controller('qr-code')
@ApiTags('Qr Codes')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class QrCodeController {
  constructor(private readonly qrCodeService: QrCodeService) {}

  @Post()
  @PermissionGuard(PermissionSubject.QrCode, Permission.Common.CREATE)
  async create(@Req() req, @Body() createQrCodeDTO: CreateQrCodeDto) {
    return await this.qrCodeService.create(req, createQrCodeDTO);
  }

  @Get()
  @PermissionGuard(PermissionSubject.QrCode, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<QrCodeDocument>> {
    return await this.qrCodeService.findAll(req, paginateOptions);
  }

  @Get(':qrCodeId')
  @PermissionGuard(PermissionSubject.QrCode, Permission.Common.FETCH)
  async findOne(@Param('qrCodeId') qrCodeId: string) {
    return await this.qrCodeService.findOne(qrCodeId);
  }

  @Patch(':qrCodeId')
  @PermissionGuard(PermissionSubject.QrCode, Permission.Common.UPDATE)
  async update(
    @Param('qrCodeId') qrCodeId: string,
    @Body() updateQrCodeDTO: UpdateQrCodeDto,
  ) {
    return await this.qrCodeService.update(qrCodeId, updateQrCodeDTO);
  }

  @Delete(':qrCodeId')
  @PermissionGuard(PermissionSubject.QrCode, Permission.Common.DELETE)
  async remove(@Param('qrCodeId') qrCodeId: string) {
    return await this.qrCodeService.remove(qrCodeId);
  }
}
