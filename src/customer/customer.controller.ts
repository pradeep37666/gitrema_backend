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
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';

import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { CustomerDocument } from './schemas/customer.schema';
import { QueryCustomerDto } from './dto/query-customer.dto';

@Controller('customer')
@ApiTags('Customers')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @PermissionGuard(PermissionSubject.Customer, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreateCustomerDto) {
    return await this.customerService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.Customer, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryCustomerDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<CustomerDocument>> {
    return await this.customerService.findAll(req, query, paginateOptions);
  }

  @Get(':customerId')
  @PermissionGuard(PermissionSubject.Customer, Permission.Common.FETCH)
  async findOne(@Param('customerId') customerId: string) {
    return await this.customerService.findOne(customerId);
  }

  @Get('profile')
  @PermissionGuard(
    PermissionSubject.Customer,
    Permission.Customer.CustomerProfileFetch,
  )
  async profile(@Req() req) {
    return await this.customerService.findOne(req.user.userId);
  }

  @Patch('profile')
  @PermissionGuard(
    PermissionSubject.Customer,
    Permission.Customer.CustomerProfileUpdate,
  )
  async profileUpdate(@Req() req, @Body() dto: UpdateCustomerDto) {
    return await this.customerService.update(req.user.userId, dto);
  }

  @Patch(':customerId')
  @PermissionGuard(PermissionSubject.Customer, Permission.Common.UPDATE)
  async update(
    @Param('customerId') customerId: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return await this.customerService.update(customerId, dto);
  }

  @Delete(':customerId')
  @PermissionGuard(PermissionSubject.Customer, Permission.Common.DELETE)
  async remove(@Param('customerId') customerId: string) {
    return await this.customerService.remove(customerId);
  }
}
