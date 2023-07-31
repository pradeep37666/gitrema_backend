import { Test, TestingModule } from '@nestjs/testing';
import { LogPayloadService } from './log-payload.service';

describe('LogPayloadService', () => {
  let service: LogPayloadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogPayloadService],
    }).compile();

    service = module.get<LogPayloadService>(LogPayloadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
