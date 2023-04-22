import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  Req,
} from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { SignupRequestDto } from '../dto/signup-request.dto';
import {
  AdminLoginDto,
  LoginRequestDto,
  RequestOtpDto,
  StaffLoginDto,
  UserVerificationOtpDto,
  VerificationOtpDto,
} from '../dto/login-request.dto';
import { AuthService } from '../services/auth.service';

import { RecoverPasswordService } from '../services/recover-password.service';
import { RecoverPasswordDto } from '../dto/recover-password.dto';
import { Public } from 'src/core/decorators/public.decorator';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { UserDocument } from 'src/users/schemas/users.schema';

@Public()
@ApiTags('Auth')
@ApiHeader({ name: 'lang' })
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly recoverPasswordService: RecoverPasswordService,
  ) {}

  @Post('signup')
  async signup(@Body() signupRequest: SignupRequestDto): Promise<UserDocument> {
    const user = await this.authService.signup(signupRequest);
    return user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req, @Body() loginRequest: LoginRequestDto): Promise<any> {
    const accessToken = await this.authService.login(req.user, loginRequest);
    return { ...req.user, accessToken };
  }

  @Post('staff-login')
  async staffLogin(
    @Req() req,
    @Body() loginRequest: StaffLoginDto,
  ): Promise<any> {
    const response = await this.authService.staffLogin(loginRequest);
    return response;
  }

  @Post('admin-login')
  async adminLogin(@Req() req, @Body() dto: AdminLoginDto): Promise<any> {
    const response = await this.authService.adminLogin(dto);
    return response;
  }

  @Post('request-otp')
  async requestOtp(
    @Req() req,
    @Body() requestOtpDetails: RequestOtpDto,
  ): Promise<any> {
    return await this.authService.requestOtp(req, requestOtpDetails);
  }

  @Post('verify-customer-otp')
  async verifyOtp(
    @Req() req,
    @Body() verificationOtpDetails: VerificationOtpDto,
  ): Promise<any> {
    return await this.authService.verifyCustomerOtp(
      req,
      verificationOtpDetails,
    );
  }

  @Post('verify-user-otp')
  async verifyUserOtp(
    @Req() req,
    @Body() verificationOtpDetails: UserVerificationOtpDto,
  ): Promise<any> {
    return await this.authService.verifyUserOtp(req, verificationOtpDetails);
  }

  @Get('public-token')
  async getTokenToAccessPublicApis(
    @Query('domain') domain: string,
  ): Promise<any> {
    return await this.authService.getTokenToAccessPublicApis(domain);
  }

  @Post('forgot-password')
  async recoverPassword(
    @Body() recoverPasswordDto: RecoverPasswordDto,
  ): Promise<any> {
    return await this.recoverPasswordService.sendChangePasswordMail(
      recoverPasswordDto,
    );
  }
}
