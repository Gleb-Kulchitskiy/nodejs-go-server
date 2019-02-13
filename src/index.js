const config = require('dotenv').config();

process.nextTick(() => {
  require('./db/postgresql');
  require('./express/app');
  if (config.NODE_ENV !== 'production') {
    require('./fixtures');
  }
});

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
  console.log(err.stack);
  process.exit(1);
});

module.exports = require('./config');
