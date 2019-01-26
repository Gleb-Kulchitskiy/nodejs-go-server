const path = require('path');
require('dotenv').config();
const config = require('./config');
const http = require('http');
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
const app = express();
const pool = new Pool({
  user: config.PG_USER,
  host: config.PG_HOST,
  database: config.PG_DATABASE,
  password: config.PG_PASSWORD,
  port: config.PG_PORT,
});

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
    if (err.status)
      res.status(err.status).send(err.msg);
    else
    // only use in development
      app.use(errorHandler());
  });

} else {
  // eslint-disable-next-line no-unused-varsF
  app.use((err, req, res, next) => {
    if (err.status)
      res.status(err.status).send(err.msg);
    else
      res.status(500).send('Server Error');
  });
}

app.listen(process.env.PORT, () => {
  console.log(`Server listening on Host: ${chalk.green(process.env.HOST)} and Port: ${chalk.blue(process.env.PORT)} in
  mode: ${chalk.yellow(process.env.NODE_ENV)}`);
});

module.exports = app;
