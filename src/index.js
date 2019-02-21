const config = require('dotenv').config();

setImmediate(async () => {
  if (config.NODE_ENV !== 'production') {
    await require('./fixtures');
  }
  require('./express/app');
});

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
  console.log(err.stack);
  process.exit(1);
});

module.exports = require('./config');
