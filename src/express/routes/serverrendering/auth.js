const express = require('express');
const { passwordHash, getError } = require('../../../utils/index');
const { query } = require('../../../db/postgresql/index');
const { body, validationResult } = require('express-validator/check');
const passport = require('../../passport/index');
const router = express.Router();

router.post('/login',
  [
    body('email', 'email should be valid').isEmail(),
    body('password', 'password should be equal or grater then 5').isLength({ min: 5 })
  ],
  (req, res, next) => {
    const result = validationResult(req).array();
    if (result.length) {
      result.forEach(obj => {
        req.flash('validationError', ` ${obj.msg}`);
      });
      return res.redirect('/login');
    }
    next();
  },
  passport.authenticate('local',
    {
      successRedirect: '/',
      failureRedirect: '/login'
    }
  )
);

router.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy((err) => {
    // todo work with this
    if (err) {
      console.log('Error : Failed to destroy the session during logout.', err);
    }
    req.user = null;
    res.redirect('/');
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
  [
    body('name', 'name should be a string and its lents should be grater then 2').isString().isLength({ min: 3 }),
    body('email', 'email should be valid').isEmail(),
    body('password', 'password should be equal or grater the 5').isLength({ min: 5 }),
  ],
  (req, res, next) => {
    const result = validationResult(req).array();
    console.log('-validator-', result);
    if (result.length) {
      const error = getError(result, 400);
      next(error);
    }
    next();
  },
  async (req, res, next) => {
    const { email, password, name } = req.body;
    let user;
    try {
      const data = await query('SELECT id FROM users WHERE email=$1;', [`${email}`]);
      user = data.rows[0];
    } catch (e) {
      return next(e);
    }
    console.log('-user-', user);
    if (user) {
      const err = getError([{ msg: 'user already exist' }], 409);
      return next(err);
    } else {
      const hashedPassword = passwordHash(password);
      let user;
      try {
        const data = await query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING*;',
          [name, email, hashedPassword]);
        user = data.rows[0];
      } catch (e) {
        return next(e);
      }
      delete user.password;
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.json({ user: req.user });
      });
    }
  }
)
;

module.exports = router;
