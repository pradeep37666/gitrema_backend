import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClientFeedbackService } from './client-feedback.service';
import { CreateClientFeedbackDto } from './dto/create-client-feedback.dto';
import { UpdateClientFeedbackDto } from './dto/update-client-feedback.dto';

@Controller('client-feedback')
export class ClientFeedbackController {
  constructor(private readonly clientFeedbackService: ClientFeedbackService) {}

  @Post()
  create(@Body() createClientFeedbackDto: CreateClientFeedbackDto) {
    return this.clientFeedbackService.create(createClientFeedbackDto);
  }

  @Get()
  findAll() {
    return this.clientFeedbackService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientFeedbackService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientFeedbackDto: UpdateClientFeedbackDto) {
    return this.clientFeedbackService.update(+id, updateClientFeedbackDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientFeedbackService.remove(+id);
  }
}
