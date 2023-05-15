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
import { WasteEventService } from './waste-event.service';
import { CreateWasteEventDto } from './dto/create-waste-event.dto';
import { UpdateWasteEventDto } from './dto/update-waste-event.dto';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { QueryWasteEventDto } from './dto/query-waste-event.dto';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { WasteEventDocument } from './schema/waste-event.schema';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';

@Controller('waste-event')
@ApiTags('Waste Event')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class WasteEventController {
  constructor(private readonly wasteEventService: WasteEventService) {}

  @Post()
  @PermissionGuard(PermissionSubject.WasteEvent, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreateWasteEventDto) {
    return await this.wasteEventService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.WasteEvent, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryWasteEventDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<WasteEventDocument>> {
    return await this.wasteEventService.findAll(req, query, paginateOptions);
  }

  @Get(':wasteEventId')
  @PermissionGuard(PermissionSubject.WasteEvent, Permission.Common.FETCH)
  async findOne(
    @Param('wasteEventId') wasteEventId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.wasteEventService.findOne(wasteEventId, i18n);
  }

  @Patch(':wasteEventId')
  @PermissionGuard(PermissionSubject.WasteEvent, Permission.Common.UPDATE)
  async update(
    @Param('wasteEventId') wasteEventId: string,
    @Body() dto: UpdateWasteEventDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.wasteEventService.update(wasteEventId, dto, i18n);
  }

  @Delete(':wasteEventId')
  @PermissionGuard(PermissionSubject.WasteEvent, Permission.Common.DELETE)
  async remove(
    @Param('wasteEventId') wasteEventId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.wasteEventService.remove(wasteEventId, i18n);
  }
}
