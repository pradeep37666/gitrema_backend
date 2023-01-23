import { Test, TestingModule } from '@nestjs/testing';
import { ClientCommentController } from './client-comment.controller';
import { ClientCommentService } from './client-comment.service';

describe('ClientCommentController', () => {
  let controller: ClientCommentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientCommentController],
      providers: [ClientCommentService],
    }).compile();

    controller = module.get<ClientCommentController>(ClientCommentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
