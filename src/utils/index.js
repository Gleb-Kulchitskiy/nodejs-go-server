const crypto = require('crypto');

exports.passwordHash = (password, salt = process.env.SALT) => {
  return crypto.createHmac('sha256', password.toString())
    .update(salt.toString())
    .digest('hex');
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