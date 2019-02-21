const path = require('path');
const config = require('../config/index');
const http = require('http');
const express = require('express');
const ioServer = require('socket.io');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('express-flash');
const PgSession = require('connect-pg-simple')(session);
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const passport = require('./passport/index');
const app = express();
const { pool } = require('../db/postgresql');

const server = http.createServer(app);
const io = ioServer(server);
require('../sockets/index')(io);

app.use(morgan('dev'));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
  store: new PgSession({
    pool
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 31557600000
}));

app.use('*', (req, res, next) => {
  req.session.flash = {};
  next();
});

require('./routes/index').init(app);

app.use('*', (req, res, next) => {
  res.sendFile(path.join(process.cwd(), 'src', 'public'));
});

// eslint-disable-next-line no-unused-varsF
app.use((err, req, res, next) => {
  console.log('-ERR-',err)
  if (err.status) res.status(err.status).send(err.message);
  else res.status(500).send('Server Error');
});

server.listen(process.env.PORT, () => {
  console.log(`Server listening on Host: ${chalk.green(process.env.HOST)} and Port: ${chalk.blue(process.env.PORT)} in
  mode: ${chalk.yellow(process.env.NODE_ENV)}`);
});

module.exports = app;
