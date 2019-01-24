const passport = require('passport');
const pgQuery = require('../db/postgresql').query;
const { Strategy: LocalStrategy } = require('passport-local');
const { passwordHash } = require('../utils');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  let user;
  try {
    const data = await pgQuery('SELECT id, first_name, last_name, email FROM users WHERE id=$1', [id]);
    user = data.rows[0];
  } catch (e) {
    done(e);
  }
  if (user) done(null, user);
  else done(null, false);
});

passport.use('local', new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  let user;
  try {
    const data = await pgQuery('SELECT id, first_name, last_name, email, password, is_anonymous FROM users WHERE email=$1', [email]);
    user = data.rows[0];
  } catch (e) {
    done(e);
  }
  if (!user) {
    return done(null, false, { msg: `Email ${email} not found.` });
  }
  const isMatch = passwordHash(password) === user.password;
  isMatch
    ? done(null, user)
    : done(null, false, { msg: 'Invalid email or password.' });
}));

module.exports = passport;
