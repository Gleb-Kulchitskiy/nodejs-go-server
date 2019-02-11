const passport = require('passport');
const pgQuery = require('../../db/postgresql/index').query;
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: FacebookStrategy } = require('passport-facebook');
const { Strategy: GitHubStrategy } = require('passport-github');
const { passwordHash } = require('../../utils/index');
const config = require('../../config/index');

const { getError } = require('../../utils/index');

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

passport.use(new FacebookStrategy(
  {
    clientID: config.FACEBOOK_ID,
    clientSecret: config.FACEBOOK_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['name', 'email', 'link', 'locale', 'timezone', 'gender'],
    passReqToCallback: true,
    state: true
  }, async (req, accessToken, refreshToken, profile, done) => {
    if (req.user) {
      let user;
      try {
        const data = await pgQuery(`UPDATE users SET facebook=$1, tokens = jsonb_set(tokens, '{ facebook }', $2,), 
        profile = jsonb_set(profile, '{name}', $3), 
        profile = jsonb_set(profile, '{gender}', $4), 
        profile = jsonb_set(profile, '{picture}', $5),
        profile = jsonb_set(profile, '{timezone}', $6), 
        WHERE id=$7
        AND 
        facebook IS NULL
        RETURNING *;`, [profile.id,
          `'${JSON.stringify({ accessToken: accessToken })}'`,
          `'${profile.name.givenName} ${profile.name.familyName}'`,
          `'${profile._json.gender}'`,
          `https://graph.facebook.com/${profile.id}/picture?type=large`,
          `'${profile.timezone}'`,
          req.user.id
        ]);
        user = data.rows[0];
      } catch (e) {
        return done(e);
      }
      if (user) {
        return done(null, user);
      } else {
        const err = getError({ msg: 'There is already a Facebook account that belongs to the logged in user' }, 409);
        return done(err);
      }
    } else {
      let user;
      try {
        const data = await pgQuery(`UPDATE users SET facebook = $1, tokens = jsonb_set(tokens, '{ facebook }', $2,), 
        profile = jsonb_set(profile, '{name}', $3), 
        profile = jsonb_set(profile, '{gender}', $4), 
        profile = jsonb_set(profile, '{picture}', $5),
        profile = jsonb_set(profile, '{timezone}', $6),
        WHERE 
        facebook = $1
        OR
        email = $7
        RETURNING *;`, [profile.id,
          `'${accessToken}'`,
          `'${profile.name.givenName} ${profile.name.familyName}'`,
          `'${profile._json.gender}'`,
          `https://graph.facebook.com/${profile.id}/picture?type=large`,
          `'${profile.timezone}'`,
          `'${profile._json.email}'`
        ]);
        user = data.rows[0];
      } catch (e) {
        return done(e);
      }
      if (user) {
        return done(null, user);
      } else {
        let user;
        try {
          const data = await pgQuery('INSERT INTO users ( email, facebook, tokens, profile ) VALUES ($1, $2, $3, $4) RETURNING *;',
            [
              `'${profile._json.email}'`,
              profile.id,
              `'${JSON.stringify({ facebook: accessToken })}'`,
              `'${JSON.stringify({
                name: `'${profile.name.givenName} ${profile.name.familyName}'`,
                gender: `'${profile._json.gender}'`,
                picture: `https://graph.facebook.com/${profile.id}/picture?type=large`,
                location: `'${(profile._json.location) ? profile._json.location.name : ''}'`
              })}'`
            ]);
          user = data.rows[0];
        } catch (e) {
          return done(e);
        }
        return done(user);
      }
    }
  }
));

passport.use(new GitHubStrategy({
  clientID: config.GITHUB_ID,
  clientSecret: config.GITHUB_SECRET,
  callbackURL: '/auth/github/callback',
  passReqToCallback: true,
  state: true
}, async (req, accessToken, refreshToken, profile, done) => {
  if (req.user) {
    let user;
    try {
      const data = await pgQuery(`UPDATE users SET github=$1, tokens = jsonb_set(tokens, '{ github }', $2,), 
        profile = jsonb_set(profile, '{name}', $3), 
        profile = jsonb_set(profile, '{picture}', $4), 
        profile = jsonb_set(profile, '{location}', $5),
        profile = jsonb_set(profile, '{website}', $6), 
        WHERE id=$7
        AND 
        github IS NULL
        RETURNING *;`, [profile.id,
        `'${JSON.stringify({ accessToken: accessToken })}'`,
        `'${profile.displayName}'`,
        `'${profile._json.avatar_url}'`,
        `'${profile._json.location}'`,
        `'${profile._json.blog}'`,
        req.user.id
      ]);
      user = data.rows[0];
    } catch (e) {
      return done(e);
    }
    if (user) {
      return done(null, user);
    } else {
      const err = getError({ msg: 'There is already a github account that belongs to user' }, 409);
      return done(err);
    }
  } else {
    let user;
    try {
      const data = await pgQuery(`UPDATE users SET github = $1, tokens = jsonb_set(tokens, '{ github }', $2,), 
        profile = jsonb_set(profile, '{name}', $3), 
        profile = jsonb_set(profile, '{picture}', $4), 
        profile = jsonb_set(profile, '{location}', $5),
        profile = jsonb_set(profile, '{website}', $6), 
        WHERE 
        github = $1
        OR
        email = $7
        RETURNING *;`, [profile.id,
        `'${accessToken}'`,
        `'${profile.displayName}'`,
        `'${profile._json.avatar_url}'`,
        `'${profile._json.location}'`,
        `'${profile._json.blog}'`,
        `'${profile._json.email}'`
      ]);
      user = data.rows[0];
    } catch (e) {
      return done(e);
    }
    if (user) {
      return done(null, user);
    } else {
      let user;
      try {
        const data = await pgQuery('INSERT INTO users ( email, github, tokens, profile ) VALUES ($1, $2, $3, $4) RETURNING *;',
          [
            `'${profile._json.email}'`,
            profile.id,
            `'${JSON.stringify({ facebook: accessToken })}'`,
            `'${JSON.stringify({
              name: `'${profile.name.profile.displayName}'`,
              picture: `'${profile._json.avatar_url}'`,
              location: `'${profile._json.location}'`,
              website: `'${profile._json.blog}'`
            })}'`
          ]);
        user = data.rows[0];
      } catch (e) {
        return done(e);
      }
      return done(user);
    }
  }
}));

module.exports = passport;
