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
import { ClientFeedbackService } from './client-feedback.service';
import { CreateClientFeedbackDto } from './dto/create-client-feedback.dto';
import { UpdateClientFeedbackDto } from './dto/update-client-feedback.dto';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';

import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { ClientFeedbackDocument } from './schemas/client-feedback.schema';
import { SubmitClientFeedbackDto } from './dto/submit-client-feedback.dto';
import { ClientFeedbackAnswerDocument } from './schemas/client-feedback-answers.schema';

@Controller('client-feedback')
@ApiTags('Client Feedback')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class ClientFeedbackController {
  constructor(private readonly clientFeedbackService: ClientFeedbackService) {}

  @Post()
  @PermissionGuard(PermissionSubject.ClientFeedback, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreateClientFeedbackDto) {
    return await this.clientFeedbackService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.ClientFeedback, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<ClientFeedbackDocument>> {
    return await this.clientFeedbackService.findAll(req, paginateOptions);
  }

  @Get(':clientFeedbackId')
  @PermissionGuard(PermissionSubject.ClientFeedback, Permission.Common.FETCH)
  async findOne(@Param('clientFeedbackId') clientFeedbackId: string) {
    return await this.clientFeedbackService.findOne(clientFeedbackId);
  }

  @Patch(':clientFeedbackId')
  @PermissionGuard(PermissionSubject.ClientFeedback, Permission.Common.UPDATE)
  async update(
    @Req() req,
    @Param('clientFeedbackId') clientFeedbackId: string,
    @Body() dto: UpdateClientFeedbackDto,
  ) {
    return await this.clientFeedbackService.update(req, clientFeedbackId, dto);
  }

  @Post(':clientFeedbackId/submit-feedback')
  @PermissionGuard(
    PermissionSubject.ClientFeedback,
    Permission.ClientFeedback.SubmitFeedback,
  )
  async submitFeedback(
    @Req() req,
    @Param('clientFeedbackId') clientFeedbackId: string,
    @Body() dto: SubmitClientFeedbackDto,
  ) {
    return await this.clientFeedbackService.submitFeedback(
      req,
      clientFeedbackId,
      dto,
    );
  }

  @Get(':clientFeedbackId/feedbacks')
  @PermissionGuard(
    PermissionSubject.ClientFeedback,
    Permission.ClientFeedback.ListFeedback,
  )
  async feedbacks(
    @Req() req,
    @Param('clientFeedbackId') clientFeedbackId: string,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<ClientFeedbackAnswerDocument>> {
    return await this.clientFeedbackService.listFeedbacks(
      req,
      clientFeedbackId,
      paginateOptions,
    );
  }

  @Delete(':clientFeedbackId')
  @PermissionGuard(PermissionSubject.ClientFeedback, Permission.Common.DELETE)
  async remove(@Param('clientFeedbackId') clientFeedbackId: string) {
    return await this.clientFeedbackService.remove(clientFeedbackId);
  }
}
