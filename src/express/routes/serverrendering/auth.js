const express = require('express');
const { passwordHash, getError } = require('../../../utils/index');
const { query } = require('../../../db/postgresql/index');
const { body, validationResult } = require('express-validator/check');
const passport = require('../../passport/index');
const router = express.Router();

router.post('/signin',
  [
    body('email', 'email should be valid').isEmail(),
    body('password', 'password should be equal or grater then 5').isLength({ min: 5 })
  ],
  (req, res, next) => {
    const result = validationResult(req).array();
    if (result.length) {
      result.forEach(obj => {
        req.flash('error', ` ${obj.msg}`);
      });
      return res.redirect('/signin');
    }
    next();
  },
  passport.authenticate('local',
    {
      successRedirect: '/',
      failureRedirect: '/signin',
      failureFlash: true
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

router.get('/facebook', passport.authenticate('facebook'));
router.get('/facebook/callback', passport.authenticate('facebook', {
  failureRedirect: '/signin'
}), (req, res) => {
  res.redirect('/');
});

router.get('/github', passport.authenticate('github'));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/signin' }), (req, res) => {
  res.redirect('/');
});

router.post('/signup',
  [
    body('name', 'name should be more then 2 characters').isString().isLength({ min: 3 }),
    body('email', 'email should be valid').isEmail(),
    body('password', 'password should be equal or grater the 5').isLength({ min: 5 })
  ],
  (req, res, next) => {
    const result = validationResult(req).array();
    if (result.length) {
      result.forEach(obj => {
        req.flash('error', ` ${obj.msg}`);
      });
      return res.redirect('/signup');
    }
    const confirm = req.body.confirm;
    const password = req.body.password;
    if (password !== confirm) {
      req.flash('error', `Fields password and confirm passwords should be equal`);
      return res.redirect('/signup');
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
        return res.redirect('/');
      });
    }
  }
);

module.exports = router;
