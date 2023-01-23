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
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { LeanDocument, PaginateResult } from 'mongoose';
import { UserService } from './users.service';
import { UserCreateDto, UserUpdateDto } from './users.dto';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { User, UserDocument } from './schemas/users.schema';
import { PaginationDto } from 'src/core/Constants/pagination';
import { STATUS_MSG } from 'src/core/Constants/status-message.constants';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('')
  @PermissionGuard(PermissionSubject.User, Permission.Common.CREATE)
  async create(
    @Request() req,
    @Body() userRequest: UserCreateDto,
  ): Promise<UserDocument> {
    return this.userService.create(req, userRequest);
  }

  @Get()
  @PermissionGuard(PermissionSubject.User, Permission.Common.LIST)
  async all(
    @Request() req,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<UserDocument>> {
    return await this.userService.all(req, paginateOptions);
  }

  @Get(':userId')
  @PermissionGuard(PermissionSubject.User, Permission.Common.FETCH)
  async fetch(@Param('userId') userId: string): Promise<LeanDocument<User>> {
    return await this.userService.fetch(userId);
  }

  @Put(':userId')
  @PermissionGuard(PermissionSubject.User, Permission.Common.UPDATE)
  async update(
    @Param('userId') userId: string,
    @Body() userDetails: UserUpdateDto,
  ): Promise<LeanDocument<User>> {
    return this.userService.update(userId, userDetails);
  }

  @Delete(':userId')
  @PermissionGuard(PermissionSubject.User, Permission.Common.DELETE)
  async delete(@Param('userId') userId: string): Promise<any> {
    const deleted = await this.userService.delete(userId);
    if (deleted) {
      return STATUS_MSG.SUCCESS.DELETED;
    }
    throw new InternalServerErrorException(STATUS_MSG.ERROR.SERVER_ERROR);
  }
}
