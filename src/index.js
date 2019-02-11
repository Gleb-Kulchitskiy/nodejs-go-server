const config = require('dotenv').config();

process.nextTick(() => {
  require('./db/postgresql');
  require('./express/app');
  if (config.NODE_ENV !== 'production') {
    require('./fixtures');
  }
});

module.exports = require('./config');
