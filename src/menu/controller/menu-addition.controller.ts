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
import { MenuAdditionService } from '../service/menu-addition.service';
import {
  CreateMenuAdditionDTO,
  UpdateMenuAdditionDTO,
} from '../dto/menu-addition.dto';
import { MenuAdditionDocument } from '../schemas/menu-addition.schema';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('menu-addition')
@ApiTags('Menu Additions')
@ApiBearerAuth('access-token')
export class MenuAdditionController {
  constructor(private readonly menuAdditionService: MenuAdditionService) {}

  @Post()
  @PermissionGuard(PermissionSubject.MenuAddition, Permission.Common.CREATE)
  async create(
    @Req() req,
    @Body() createMenuAdditionDTO: CreateMenuAdditionDTO,
  ) {
    return await this.menuAdditionService.create(req, createMenuAdditionDTO);
  }

  @Get()
  @PermissionGuard(PermissionSubject.MenuAddition, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<MenuAdditionDocument>> {
    return await this.menuAdditionService.findAll(req, paginateOptions);
  }

  @Get(':menuAdditionId')
  @PermissionGuard(PermissionSubject.MenuAddition, Permission.Common.FETCH)
  async findOne(@Param('menuAdditionId') menuAdditionId: string) {
    return await this.menuAdditionService.findOne(menuAdditionId);
  }

  @Patch(':menuAdditionId')
  @PermissionGuard(PermissionSubject.MenuAddition, Permission.Common.UPDATE)
  async update(
    @Param('menuAdditionId') menuAdditionId: string,
    @Body() updateMenuAdditionDTO: UpdateMenuAdditionDTO,
  ) {
    return await this.menuAdditionService.update(
      menuAdditionId,
      updateMenuAdditionDTO,
    );
  }

  @Delete(':menuAdditionId')
  @PermissionGuard(PermissionSubject.MenuAddition, Permission.Common.DELETE)
  async remove(@Param('menuAdditionId') menuAdditionId: string) {
    return await this.menuAdditionService.remove(menuAdditionId);
  }
}
