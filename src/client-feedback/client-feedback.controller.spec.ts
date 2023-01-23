import { Test, TestingModule } from '@nestjs/testing';
import { ClientFeedbackController } from './client-feedback.controller';
import { ClientFeedbackService } from './client-feedback.service';

describe('ClientFeedbackController', () => {
  let controller: ClientFeedbackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientFeedbackController],
      providers: [ClientFeedbackService],
    }).compile();

    controller = module.get<ClientFeedbackController>(ClientFeedbackController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
