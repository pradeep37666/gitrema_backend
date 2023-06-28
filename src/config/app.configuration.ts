import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.APP_ENV,
  name: process.env.APP_NAME,
  url: process.env.APP_URL,
  baseUrl: process.env.BASE_URL,
  frontendBaseUrl: process.env.FRONTEND_BASE_URL,
  whatsappBaseUrl: process.env.WHATSAPP_BASE_URL,
  port: process.env.APP_PORT,
  superAdminToken: process.env.PROD_SUPER_ADMIN_TOKEN,
}));
