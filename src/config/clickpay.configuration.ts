import { registerAs } from '@nestjs/config';

export default registerAs('clickpay', () => ({
  CLICKPAY_PROFILE_ID: process.env.CLICKPAY_PROFILE_ID,
  CLICKPAY_SERVER_KEY: process.env.CLICKPAY_SERVER_KEY,
  CLICKPAY_API_URL: process.env.CLICKPAY_API_URL,
}));
