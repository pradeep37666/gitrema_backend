import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import {
  ChangePasswordDto,
  RecoverPassword,
} from '../dto/changes-password.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RecoverPasswordService } from '../services/recover-password.service';

@ApiTags('Auth')
@ApiBearerAuth('access-token')
@Controller('auth')
@ApiHeader({ name: 'lang' })
export class ChangePasswordController {
  constructor(
    private readonly recoverPasswordService: RecoverPasswordService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('recover-password')
  async recoverPassword(
    @Req() req: any,
    @Body() changePassword: RecoverPassword,
  ): Promise<any> {
    return await this.recoverPasswordService.changePassword(
      req,
      changePassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Req() req: any,
    @Body() changePassword: ChangePasswordDto,
  ): Promise<any> {
    return await this.recoverPasswordService.changePassword(
      req,
      changePassword,
    );
  }
}
