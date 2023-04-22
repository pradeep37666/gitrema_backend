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
import { OfferService } from './offer.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { QueryOfferDto } from './dto/query-offer.dto';
import { OfferDocument } from './schemas/offer.schema';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';

@Controller('offer')
@ApiTags('Offers')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post()
  @PermissionGuard(PermissionSubject.Offer, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreateOfferDto) {
    return await this.offerService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.Offer, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryOfferDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<OfferDocument>> {
    return await this.offerService.findAll(req, query, paginateOptions);
  }

  @Get(':offerId')
  @PermissionGuard(PermissionSubject.Offer, Permission.Common.FETCH)
  async findOne(@Param('offerId') offerId: string) {
    return await this.offerService.findOne(offerId);
  }

  @Get('search-by-code/:code')
  @PermissionGuard(PermissionSubject.Offer, Permission.Common.FETCH)
  async checkCode(@Param('code') code: string) {
    return await this.offerService.findByCode(code);
  }

  @Patch(':offerId')
  @PermissionGuard(PermissionSubject.Offer, Permission.Common.UPDATE)
  async update(@Param('offerId') offerId: string, @Body() dto: UpdateOfferDto) {
    return await this.offerService.update(offerId, dto);
  }

  @Delete(':offerId')
  @PermissionGuard(PermissionSubject.Offer, Permission.Common.DELETE)
  async remove(@Param('offerId') offerId: string) {
    return await this.offerService.remove(offerId);
  }
}
