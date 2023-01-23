import { registerAs } from '@nestjs/config';

export default registerAs('asmsc', () => ({
  GATEWAY_SMS_API_ID: process.env.GATEWAY_SMS_API_ID,
  GATEWAY_SMS_API_PASSWORD: process.env.GATEWAY_SMS_API_PASSWORD,
  GATEWAY_SMS_SENDER_ID: process.env.GATEWAY_SMS_SENDER_ID,
  GATEWAY_SMS_BRAND: process.env.GATEWAY_SMS_BRAND,
}));
