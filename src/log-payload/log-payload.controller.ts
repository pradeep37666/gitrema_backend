import { Controller } from '@nestjs/common';
import { LogPayloadService } from './log-payload.service';

@Controller('log-payload')
export class LogPayloadController {
  constructor(private readonly logPayloadService: LogPayloadService) {}
}
