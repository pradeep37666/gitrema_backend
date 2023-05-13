import { registerAs } from '@nestjs/config';

export default registerAs('firebase', () => ({
  FIREBASE_CREDENTIAL_JSON: process.env.FIREBASE_CREDENTIAL_JSON,
  FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
}));
