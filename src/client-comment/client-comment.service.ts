import { Injectable } from '@nestjs/common';
import { CreateClientCommentDto } from './dto/create-client-comment.dto';
import { UpdateClientCommentDto } from './dto/update-client-comment.dto';

@Injectable()
export class ClientCommentService {
  create(createClientCommentDto: CreateClientCommentDto) {
    return 'This action adds a new clientComment';
  }

  findAll() {
    return `This action returns all clientComment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} clientComment`;
  }

  update(id: number, updateClientCommentDto: UpdateClientCommentDto) {
    return `This action updates a #${id} clientComment`;
  }

  remove(id: number) {
    return `This action removes a #${id} clientComment`;
  }
}
