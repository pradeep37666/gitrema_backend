import { registerAs } from '@nestjs/config';

export default registerAs('aws', () => ({
  AWS_S3_ACCESS_KEY: process.env.AWS_S3_ACCESS_KEY,
  AWS_S3_KEY_SECRET: process.env.AWS_S3_KEY_SECRET,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  AWS_S3_URL: process.env.AWS_S3_URL,
  AWS_S3_CF_URL: process.env.AWS_S3_CF_URL,
  AWS_REDIS_HOST: process.env.AWS_REDIS_HOST,
  AWS_REDIS_PORT: process.env.AWS_REDIS_PORT,
}));
