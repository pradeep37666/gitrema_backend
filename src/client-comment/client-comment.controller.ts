import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClientCommentService } from './client-comment.service';
import { CreateClientCommentDto } from './dto/create-client-comment.dto';
import { UpdateClientCommentDto } from './dto/update-client-comment.dto';

@Controller('client-comment')
export class ClientCommentController {
  constructor(private readonly clientCommentService: ClientCommentService) {}

  @Post()
  create(@Body() createClientCommentDto: CreateClientCommentDto) {
    return this.clientCommentService.create(createClientCommentDto);
  }

  @Get()
  findAll() {
    return this.clientCommentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientCommentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientCommentDto: UpdateClientCommentDto) {
    return this.clientCommentService.update(+id, updateClientCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientCommentService.remove(+id);
  }
}
