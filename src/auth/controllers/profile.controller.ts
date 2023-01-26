import { Controller, Get, Body, Put, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LeanDocument } from 'mongoose';
import { User } from 'src/users/schemas/users.schema';
import { UserUpdateDto } from 'src/users/users.dto';
import { UserService } from 'src/users/users.service';

@ApiTags('Profile')
@ApiBearerAuth('access-token')
@Controller('profile')
export class ProfileController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async fetch(@Req() req): Promise<LeanDocument<User>> {
    return await this.userService.fetch(req.user.userId);
  }

  @Put('me')
  async update(
    @Req() req,
    @Body() userDetails: UserUpdateDto,
  ): Promise<LeanDocument<User>> {
    return this.userService.update(req.user.userId, userDetails);
  }
}
