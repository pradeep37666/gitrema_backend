import { registerAs } from '@nestjs/config';

export default registerAs('taqnyat', () => ({
  TAQNYAT_TOKEN: process.env.TAQNYAT_TOKEN,
  TAQNYAT_SENDER: process.env.TAQNYAT_SENDER,
}));
