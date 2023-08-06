import { Body, Controller, Post, Req } from '@nestjs/common';

import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Permission } from 'src/core/Constants/permission.type';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { InvalidateCacheDto } from './dto/invalidate-cache.dto';
import { CacheDataService } from './cache-data.service';

@Controller('cache')
@ApiTags('Cache')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class CacheController {
  constructor(private readonly cacheDataService: CacheDataService) {}

  @Post('invalidate')
  // @PermissionGuard(
  //   PermissionSubject.Restricted,
  //   Permission.Restricted.InvalidateCache,
  // )
  async create(@Req() req, @Body() dto: InvalidateCacheDto) {
    return await this.cacheDataService.invalidateCache(req, dto);
  }
}
