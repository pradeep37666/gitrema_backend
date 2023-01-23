import { registerAs } from '@nestjs/config';

export default registerAs('mongo', () => ({
  dbUrl: process.env.MONGO_URL,
}));
