const path = require('path');
const http = require('http');
const express = require('express');
const ioServer = require('socket.io');
const helmet = require('helmet');
const morgan = require('morgan');
let session = require('express-session');
const sharedsession = require('express-socket.io-session');
const flash = require('express-flash');
const PgSession = require('connect-pg-simple')(session);
const chalk = require('chalk');
const passport = require('./passport/index');
const app = express();
const { pool } = require('../db/postgresql');
const config = require('../config');
const server = http.createServer(app);
const io = ioServer(server);

app.use(morgan('dev'));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'src', 'public')));

session = session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: {
    maxAge: 1209600000
  }
});
app.use(session);
require('../sockets/index')(io, sharedsession, session);

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 31557600000
}));

app.use(passport.initialize());
app.use(passport.session());

if (config.SERVER_RENDERING) {
  console.log('-server rendering-',);
  app.use(flash());
  app.set('views', path.join(process.cwd(), '/src/views'));
  app.set('view engine', 'pug');
  app.locals.basedir = path.join(process.cwd(), 'src');
  require('./routes/serverrendering/index').init(app);
} else {
  require('./routes/singlepage/index').init(app);
  app.use('*', (req, res, next) => {
    res.sendFile(path.join(process.cwd(), 'src', 'public'));
  });
}

// eslint-disable-next-line no-unused-varsF
app.use((err, req, res, next) => {
  console.log('-ERR-', err);
  if (err.status) res.status(err.status).send(err.message);
  else res.status(500).send('Server Error');
});

server.listen(process.env.PORT, () => {
  console.log(`Server listening on Host: ${chalk.green(process.env.HOST)} and Port: ${chalk.blue(process.env.PORT)} in
  mode: ${chalk.yellow(process.env.NODE_ENV)}`);
});

module.exports = app;
