import { Test, TestingModule } from '@nestjs/testing';
import { LogPayloadController } from './log-payload.controller';
import { LogPayloadService } from './log-payload.service';

describe('LogPayloadController', () => {
  let controller: LogPayloadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogPayloadController],
      providers: [LogPayloadService],
    }).compile();

    controller = module.get<LogPayloadController>(LogPayloadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
