import { registerAs } from '@nestjs/config';

export default registerAs('yallow', () => ({
  API_BASE_URL: process.env.YALLOW_API_BASE_URL,
  TOKEN: process.env.YALLOW_TOKEN,
}));
