import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { GlobalConfigService } from './global-config.service';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { Permission } from 'src/core/Constants/permission.type';
import { CreateGlobalConfigDto } from './dto/create-global-config.dto';
import { GlobalConfigDocument } from './schema/global-config.schema';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';

@Controller('global-config')
@ApiTags('Global Config')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class GlobalConfigController {
  constructor(private readonly globalConfigService: GlobalConfigService) {}

  @Post()
  @PermissionGuard(PermissionSubject.GlobalConfig, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreateGlobalConfigDto) {
    return await this.globalConfigService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.GlobalConfig, Permission.Common.FETCH)
  async findAll(): Promise<GlobalConfigDocument> {
    return await this.globalConfigService.fetch();
  }
}
