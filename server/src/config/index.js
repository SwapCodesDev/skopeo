const path = require('path');

module.exports = {
    PORT: process.env.PORT || 3000,
    TIMEOUT: 10000, // 10 seconds
    USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    STATIC_DIR: path.join(__dirname, '../../public')
};
