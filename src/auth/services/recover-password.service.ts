import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import Handlebars from 'handlebars';
import { RecoverPasswordDto } from '../dto/recover-password.dto';

import { LeanDocument, Model } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';
import {
  ChangePasswordDto,
  RecoverPassword,
} from '../dto/changes-password.dto';

import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { STATUS_MSG } from 'src/core/Constants/status-message.constants';
import { UserService } from 'src/users/users.service';
import { User, UserDocument } from 'src/users/schemas/users.schema';
import {
  EmailTemplate,
  EmailTemplateDocument,
} from 'src/notification/email-templates/schemas/email-template.schema';
import { MailService } from 'src/notification/mail/mail.service';
import { CustomEvent } from 'src/core/Constants/enum';

@Injectable()
export class RecoverPasswordService {
  constructor(
    @InjectModel(EmailTemplate.name)
    private emailTemplateModel: Model<EmailTemplateDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private userService: UserService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async sendChangePasswordMail(
    recoverPasswordDto: RecoverPasswordDto,
  ): Promise<any> {
    // 1. find the email user
    const userExists = await this.userService.findByEmail(
      recoverPasswordDto.email,
    );

    if (!userExists) {
      throw new BadRequestException(STATUS_MSG.ERROR.RECORD_NOT_FOUND);
    }

    // 2. create jwt token 30 min expiry with userID and email
    const user = {
      userId: userExists._id,
    };

    const accessToken = await this.generateAuthToken(user, '30m');

    // 3. generate email template for forgot password

    const templateData = await this.findBySlug(CustomEvent.ForgotPassword);

    if (!templateData) {
      throw new InternalServerErrorException(STATUS_MSG.ERROR.SERVER_ERROR);
    }

    // 4. attached reset password link with token

    const template = Handlebars.compile(templateData.body, { noEscape: true });

    const html = template({
      ForgotPasswordLink: `${this.configService.get(
        'app.frontendBaseUrl',
      )}?token=${accessToken}`,
    });

    // 5. send email to the user

    return this.mailService.send({
      to: recoverPasswordDto.email,
      subject: 'Recover Password',
      body: html,
    });
  }

  private async generateAuthToken(
    payload: { userId: string },
    expiry = '800s',
  ) {
    return this.jwtService.sign(payload, { expiresIn: expiry });
  }

  private async findBySlug(
    slug: CustomEvent,
  ): Promise<LeanDocument<EmailTemplateDocument>> {
    const template = await this.emailTemplateModel.findOne({ slug });
    return template;
  }

  async changePassword(
    req: any,
    data: ChangePasswordDto | RecoverPassword,
  ): Promise<any> {
    if (data.currentPassword) {
      const user = await this.userModel.findById(req.user.userId).lean();
      if (!(await bcrypt.compare(data.currentPassword, user.password))) {
        throw new BadRequestException(STATUS_MSG.ERROR.UNAUTHORIZED);
      }
    }

    const user = await this.userModel.findById(req.user.userId);
    user.password = data.password;
    if (!user.save()) {
      throw new ForbiddenException(STATUS_MSG.ERROR.SERVER_ERROR);
    }
    delete user.password;
    return user;
  }
}
