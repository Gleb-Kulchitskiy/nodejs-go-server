const crypto = require('crypto');

exports.passwordHash = (password, salt = process.env.SALT) => {
  return crypto.createHmac('sha256', password.toString())
    .update(salt.toString())
    .digest('hex');
};
exports.getError = (errors = [], status) => {
  const err = {};
  err.msg = errors.reduce((p, c) => {
    p.push(c.msg);
    return p;
  }, []);
  err.status = status || 500;
  return err;
};