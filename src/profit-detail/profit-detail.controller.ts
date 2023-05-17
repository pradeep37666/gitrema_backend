import { Controller, Get, Query, Req } from '@nestjs/common';
import { ProfitDetailService } from './profit-detail.service';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import {
  ProfitDetail,
  ProfitDetailDocument,
} from './schema/profit-detail.schema';
import { QueryProfitDetailDto } from './dto/query-profit-detail.dto';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';

@Controller('profit-detail')
@ApiTags('Profit Details')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class ProfitDetailController {
  constructor(private readonly profitDetailService: ProfitDetailService) {}

  @Get()
  @PermissionGuard(PermissionSubject.ProfitDetails, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryProfitDetailDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<ProfitDetailDocument>> {
    return await this.profitDetailService.findAll(req, query, paginateOptions);
  }
}
