import { Test, TestingModule } from '@nestjs/testing';
import { ClientFeedbackService } from './client-feedback.service';

describe('ClientFeedbackService', () => {
  let service: ClientFeedbackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientFeedbackService],
    }).compile();

    service = module.get<ClientFeedbackService>(ClientFeedbackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
