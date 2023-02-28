import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { ChangePasswordController } from './controllers/change-password.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/users/users.module';
import { SupplierModule } from 'src/supplier/Supplier.module';
import { SmsModule } from 'src/core/Providers/Sms/sms.module';
import { jwtConstants } from 'src/core/Constants/auth.constants';
import { ProfileController } from './controllers/profile.controller';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RecoverPasswordService } from './services/recover-password.service';
import { User, UserSchema } from 'src/users/schemas/users.schema';
import { Role, RoleSchema } from 'src/role/schemas/roles.schema';
import { Otp, OtpSchema } from './schemas/otp.schema';
import { MailModule } from 'src/notification/mail/mail.module';
import {
  EmailTemplate,
  EmailTemplateSchema,
} from 'src/notification/email-templates/schemas/email-template.schema';
import {
  Supplier,
  SupplierSchema,
} from 'src/supplier/schemas/suppliers.schema';
import { Customer, CustomerSchema } from 'src/customer/schemas/customer.schema';
import {
  SupplierPackage,
  SupplierPackageSchema,
} from 'src/supplier/schemas/supplier-package.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Supplier.name, schema: SupplierSchema },
      { name: User.name, schema: UserSchema },
      { name: Supplier.name, schema: SupplierSchema },
      { name: SupplierPackage.name, schema: SupplierPackageSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Otp.name, schema: OtpSchema },
      { name: EmailTemplate.name, schema: EmailTemplateSchema },
      { name: Customer.name, schema: CustomerSchema },
    ]),

    UserModule,
    PassportModule,
    SupplierModule,
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: jwtConstants.secret,
      }),
    }),

    SmsModule,

    MailModule,
  ],
  controllers: [AuthController, ProfileController, ChangePasswordController],
  providers: [AuthService, LocalStrategy, JwtStrategy, RecoverPasswordService],
})
export class AuthModule {}
