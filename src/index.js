require('dotenv').config();

process.nextTick(() => {
  require('./db/postgresql');
  require('./express/app');
  require('./fixtures');
});

module.exports = require('./config');
