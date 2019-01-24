const http = require('http');
const path = require('path');
const express = require('express');
const ioServer = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('express-flash');
const { Pool } = require('pg');
const PgSession = require('connect-pg-simple')(session);
const expressValidator = require('express-validator');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const passport = require('./passport');
require('dotenv').config();

const app = express();
const pool = new Pool();

const server = http.createServer(app);
const io = ioServer(server);
require('./sockets')(io);

app.use(morgan('dev'));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(expressValidator());
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

app.use('/*', (req, res, next) => {
  req.session.flash = {};
  next();
});

require('./routes').init(app);

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    let error;
    try {
      error = JSON.parse(err.message);
    } catch (e) {
      res.status(500).send(JSON.stringify(e));
    }
    if (error && error.status) {
      res.status(error.status).json(error);
    }
    else
    // only use in development
    app.use(errorHandler());
  });

} else {
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    let error;
    try {
      error = JSON.parse(err);
    } catch (e) {
      res.status(500).send('Server Error');
    }
    if (error.status)
      res.status(error.status).send(error.msg);
    else
      res.status(500).send('Server Error');
  });
}

app.listen(process.env.PORT, () => {
  console.log(`Server listening on Host: ${chalk.green(process.env.HOST)} and Port: ${chalk.blue(process.env.PORT)} in
  mode: ${chalk.yellow(process.env.NODE_ENV)}`);
});

module.exports = app;
