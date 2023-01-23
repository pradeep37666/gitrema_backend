const {
    join
} = require("path");

module.exports = {
    // Changes the cache location for Puppeteer.
    cacheDirectory: join(__dirname, '/usr/bin/google-chrome'),
};