const authRouter = require('./auth');
const initRouter = require('./init');

module.exports.init = (app) => {
  app.use('/auth', authRouter);
  app.use('./init', initRouter);
};
