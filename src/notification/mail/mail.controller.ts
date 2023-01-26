import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Param,
  Put,
  Delete,
  InternalServerErrorException,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SendMailDto } from './mail.dto';
import { MailService } from './mail.service';

@ApiTags('Mail')
@ApiBearerAuth('access-token')
@Controller('mail/adhoc-send')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('')
  async adhocSend(
    @Req() req,
    @Body() mailRequest: SendMailDto,
  ): Promise<boolean> {
    await this.mailService.send(mailRequest);
    return true;
  }
}
