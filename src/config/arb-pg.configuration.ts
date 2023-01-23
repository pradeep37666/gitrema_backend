import { registerAs } from '@nestjs/config';

export default registerAs('arbPg', () => ({
  ARB_PG_TERMINAL_ID: process.env.ARB_PG_TERMINAL_ID,
  ARB_PG_TRANSPORTAL_ID: process.env.ARB_PG_TRANSPORTAL_ID,
  ARB_PG_TRANSPORTAL_PASSWORD: process.env.ARB_PG_TRANSPORTAL_PASSWORD,
  ARB_PG_RESOURCE_KEY: process.env.ARB_PG_RESOURCE_KEY,
  ARB_PG_API_URL: process.env.ARB_PG_API_URL,
}));
