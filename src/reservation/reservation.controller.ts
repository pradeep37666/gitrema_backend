import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { QueryReservationDto } from './dto/query-reservation.dto';
import { ReservationDocument } from './schemas/reservation.schema';

@ApiTags('Reservation')
@ApiBearerAuth('access-token')
@Controller('reservation')
@ApiHeader({ name: 'lang' })
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @PermissionGuard(PermissionSubject.Reservation, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreateReservationDto) {
    return await this.reservationService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.Reservation, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryReservationDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<ReservationDocument>> {
    return await this.reservationService.findAll(req, query, paginateOptions);
  }

  @Get(':reservationId')
  @PermissionGuard(PermissionSubject.Reservation, Permission.Common.FETCH)
  async findOne(@Param('reservationId') reservationId: string) {
    return await this.reservationService.findOne(reservationId);
  }

  @Patch(':reservationId')
  @PermissionGuard(PermissionSubject.Reservation, Permission.Common.UPDATE)
  async update(
    @Param('reservationId') reservationId: string,
    @Body() dto: UpdateReservationDto,
  ) {
    return await this.reservationService.update(reservationId, dto);
  }

  @Delete(':reservationId')
  @PermissionGuard(PermissionSubject.Reservation, Permission.Common.DELETE)
  async remove(@Param('reservationId') reservationId: string) {
    return await this.reservationService.remove(reservationId);
  }
}
