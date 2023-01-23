import { Test, TestingModule } from '@nestjs/testing';
import { ClientCommentService } from './client-comment.service';

describe('ClientCommentService', () => {
  let service: ClientCommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientCommentService],
    }).compile();

    service = module.get<ClientCommentService>(ClientCommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
