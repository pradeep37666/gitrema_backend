import { Injectable } from '@nestjs/common';
import { CreateClientFeedbackDto } from './dto/create-client-feedback.dto';
import { UpdateClientFeedbackDto } from './dto/update-client-feedback.dto';

@Injectable()
export class ClientFeedbackService {
  create(createClientFeedbackDto: CreateClientFeedbackDto) {
    return 'This action adds a new clientFeedback';
  }

  findAll() {
    return `This action returns all clientFeedback`;
  }

  findOne(id: number) {
    return `This action returns a #${id} clientFeedback`;
  }

  update(id: number, updateClientFeedbackDto: UpdateClientFeedbackDto) {
    return `This action updates a #${id} clientFeedback`;
  }

  remove(id: number) {
    return `This action removes a #${id} clientFeedback`;
  }
}
