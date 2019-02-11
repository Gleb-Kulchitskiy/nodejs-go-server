const crypto = require('crypto');
const config = require('../index');
exports.passwordHash = (password, salt = config.SALT) => {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
};
exports.getError = (errors = [], status) => {
  const err = new Error();
  const message = errors.reduce((p, c) => {
    p.push(c.msg);
    return p;
  }, []);
  err.message = JSON.stringify(message);
  err.status = status || 500;
  return err;
};
