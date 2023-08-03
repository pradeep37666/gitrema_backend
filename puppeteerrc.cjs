const { join } = require('path');

module.exports = {
  // Changes the cache location for Puppeteer.
  cacheDirectory: join(__dirname, process.env.CHROME_PATH),
};
