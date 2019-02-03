const Router = require('express-promise-router');
const { passwordHash, getError } = require('../utils');
const { query } = require('../db/postgresql');
const router = new Router();
const passport = require('../passport');

router.get('/login', (req, res) => {
  if (req.user) {
    return res.json(req.user);
  } else {
    return res.status(401).send('unauthorized');
  }
});

router.post('/login',
  (req, res, next) => {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();
    if (errors) {
      const err = getError(errors, 400);
      return next(err);
    }

    next();
  },
  passport.authenticate('local'),
  (req, res, next) => {
    if (req.user) {
      res.json({ user: req.user });
    } else {
      next(new Error('something went wrong'));
    }
  });

router.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy((err) => {
    // todo work with this
    if (err) {
      console.log('Error : Failed to destroy the session during logout.', err);
    }
    req.user = null;
    res.status(200).send('user successfully logout ');
  });
});

router.get('/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});

router.get('/auth/github', passport.authenticate('github'));
router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});

router.post('/singup',
  (req, res, next) => {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password must be at least 6 characters long').len(6);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();
    console.log('-errore-', errors);
    if (errors) {
      const err = getError(errors, 400);
      return next(err);
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
      return next(e);
    }

    if (user) {
      const err = getError([{ msg: 'user already exist' }], 409);
      return next(err);
    } else {
      const hashedPassword = passwordHash(password);
      let user;
      try {
        const data = await query('INSERT INTO users (first_name, last_name, email, password, is_anonymous) VALUES ($1, $2, $3, $4, $5) RETURNING*;',
          [firstName, lastName, email, hashedPassword, 0]);
        user = data.rows[0];
      } catch (e) {
        return next(e);
      }
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.json({ user: req.user });
      });
    }
  });

router.post('/singupanonymous', async (req, res, next) => {
  const { firstName } = req.body;
  const email = firstName;
  let user;
  try {
    const data = await query('SELECT id FROM users WHERE email=$1', [email]);
    user = data.rows[0];
  } catch (e) {
    return next(e);
  }

  if (user) {
    const err = getError([{ msg: 'userName already busy' }], 409);
    return next(err);
  } else {
    let user;
    try {
      const data = await query('INSERT INTO users (first_name, email, is_anonymous) VALUES ($1, $2, $3) RETURNING*;',
        [firstName, email, 1]);
      user = data.rows[0];
    } catch (e) {
      return next(e);
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ user: req.user });
    });
  }
})
;

module.exports = router;