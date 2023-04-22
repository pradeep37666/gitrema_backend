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
import { ScreenDisplayService } from './screen-display.service';
import { CreateScreenDisplayDto } from './dto/create-screen-display.dto';
import { UpdateScreenDisplayDto } from './dto/update-screen-display.dto';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { ScreenDisplayDocument } from './schemas/screen-display.schema';

@Controller('screen-display')
@ApiTags('Screen Displays')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class ScreenDisplayController {
  constructor(private readonly screenDisplayService: ScreenDisplayService) {}

  @Post()
  @PermissionGuard(PermissionSubject.ScreenDisplay, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreateScreenDisplayDto) {
    return await this.screenDisplayService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.ScreenDisplay, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<ScreenDisplayDocument>> {
    return await this.screenDisplayService.findAll(req, paginateOptions);
  }

  @Patch(':screenDisplayId')
  @PermissionGuard(PermissionSubject.ScreenDisplay, Permission.Common.UPDATE)
  async update(
    @Param('screenDisplayId') screenDisplayId: string,
    @Body() dto: UpdateScreenDisplayDto,
  ) {
    return await this.screenDisplayService.update(screenDisplayId, dto);
  }

  @Delete(':screenDisplayId')
  @PermissionGuard(PermissionSubject.ScreenDisplay, Permission.Common.DELETE)
  async remove(@Param('screenDisplayId') screenDisplayId: string) {
    return await this.screenDisplayService.remove(screenDisplayId);
  }
}
