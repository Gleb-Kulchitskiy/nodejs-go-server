const authRouter = require('./auth');
const initRouter = require('./main');

module.exports.init = (app) => {
  app.use('/auth', authRouter);
  app.use('./init', initRouter);
};
