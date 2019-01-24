const Router = require('express-promise-router');
const { passwordHash, getError } = require('../utils');
const { query } = require('../db/postgresql');
const router = new Router();
const passport = require('../passport');
const path = require('path');

router.get('/login', (req, res) => {
  if (req.user)
    return res.status(200).json(req.user);
  else
    return res.status(401).send('unauthorized');
});

router.post('/login', (req, res, next) => {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();
    if (errors) {
      const err = getError(errors, 400);
      return next(new Error(JSON.stringify(err)));
    }

    next();
  },
  passport.authenticate('local'),
  (req, res, next) => {
    if (req.user)
      res.status(200).send('User successfully logged in');
    else
      next(new Error('something went wrong'));
  }
);


router.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy((err) => {
    // todo work with this
    if (err)
      console.log('Error : Failed to destroy the session during logout.', err);
    req.user = null;
    res.status(200).send('user successfully logout ');
  });
});

router.post('/singup',
  (req, res, next) => {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password must be at least 6 characters long').len(6);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();
    if (errors) {
      const err = getError(errors, 400);
      return next(new Error(JSON.stringify(err)));
    }

    next();
  },
  async (req, res, next) => {
    const { email, password, firstName = null, lastName = null } = req.body;
    let user;
    try {
      const data = await query('SELECT id FROM users WHERE email=$1', [email]);
      user = data.rows[0];
    } catch (e) {
      console.log('-e-', e);
      return next(e);
    }

    if (user) return next(new Error('user already exist'));
    else {
      const hashedPassword = passwordHash(password);
      let user;
      try {
        user = await query('INSERT INTO users (first_name, last_name, email, password, is_anonymous) VALUES ($1, $2, $3, $4, $5) RETURNING*;',
          [firstName, lastName, email, hashedPassword, 0]);
      } catch (e) {
        next(e);
      }

      req.logIn(user.rows[0], (err) => {
        if (err) return next(err);
        return res.end('user was saved');
      });
    }
  });

router.post('/singupanonymous', async (req, res, next) => {
  const { firstName } = req.body;
  let user;
  try {
    const data = await query('SELECT id FROM users WHERE first_name=$1', [firstName]);
    user = data.rows[0];
  } catch (e) {
    return next(e);
  }

  if (user) return next(new Error('userName already exist'));
  else {
    const user = await query('INSERT INTO users (first_name, is_anonymous) VALUES ($1, $2) RETURNING*;',
      [firstName, 1]);
    req.logIn(user.rows[0], (err) => {
      if (err) return next(err);
      return res.end('anonymous user was saved');
    });
  }
});

module.exports = router;
