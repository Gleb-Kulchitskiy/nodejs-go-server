const authRouter = require('./auth');

module.exports.init = (app) => {
  app.use('/auth', authRouter);
};
