const passport = require('passport');
const pgQuery = require('../../db/postgresql/index').query;
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: FacebookStrategy } = require('passport-facebook');
const { Strategy: GitHubStrategy } = require('passport-github');
const { passwordHash } = require('../../utils/index');
const config = require('../../config/index');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  let user;
  try {
    const data = await pgQuery('SELECT id, name, email FROM users WHERE id=$1', [id]);
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
    const data = await pgQuery('SELECT id, name, email, password FROM users WHERE email=$1', [`${email}`]);
    user = data.rows[0];
  } catch (e) {
    done(e);
  }
  if (!user) {
    return done(null, false, { message: `Incorrect ${email} email or password.` });
  }
  const isMatch = passwordHash(password) === user.password;
  isMatch
    ? done(null, { id: user.id, email: user.email, name: user.name })
    : done(null, false, { message: `Incorrect ${email} email or password.` });
}));

passport.use(new FacebookStrategy(
  {
    clientID: config.FACEBOOK_ID,
    clientSecret: config.FACEBOOK_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['name', 'email', 'gender'],
    passReqToCallback: true,
    state: true
  }, async (req, accessToken, refreshToken, profile, done) => {
    const _profile = {
      name: `${profile.name.givenName} ${profile.name.familyName}`,
      gender: `${profile._json.gender}`,
      picture: `https://graph.facebook.com/${profile.id}/picture?type=large`
    };
    if (req.user) {
      let user;
      try {
        const data = await pgQuery(`UPDATE users SET facebook=$1, profile=jsonb_set(profile, '{ facebook }', $2),
        tokens = jsonb_set(tokens, '{ facebook }', $3) 
        WHERE id=$4
        AND 
        facebook IS NULL
        RETURNING *;`, [profile.id,
          JSON.stringify(_profile),
          JSON.stringify(accessToken),
          req.user.id
        ]);
        user = data.rows[0];
      } catch (e) {
        return done(e);
      }
      if (user) {
        return done(null, user);
      } else {
        req.flash('error', 'There is already a Facebook account that belongs to the logged in user');
        return done(null, false);
      }
    } else {
      let user;
      try {
        const data = await pgQuery(`UPDATE users SET facebook = $1, tokens=jsonb_set(tokens, '{facebook}', $2), 
        profile=jsonb_set(profile, '{facebook}', $3)
        WHERE 
        facebook = $1
        OR
        email = $4
        RETURNING *;`, [profile.id,
          JSON.stringify(accessToken),
          JSON.stringify(_profile),
          profile._json.email
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
          const data = await pgQuery('INSERT INTO users ( email, facebook, tokens, profile, name ) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
            [
              profile._json.email,
              profile.id,
              JSON.stringify({ facebook: accessToken }),
              JSON.stringify({ facebook: _profile }),
              _profile.name
            ]);
          user = data.rows[0];
        } catch (e) {
          return done(e);
        }
        return done(null, user);
      }
    }
  }
));

passport.use(new GitHubStrategy({
  clientID: config.GITHUB_ID,
  clientSecret: config.GITHUB_SECRET,
  callbackURL: 'http://127.0.0.1:3000/auth/github/callback',
  passReqToCallback: true,
  scope: ['user:email']
}, async (req, accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value;
  const _profile = {
    name: profile.username,
    profileUrl: profile.profileUrl,
    gender: `${profile._json.gender}`,
    picture: profile._json.avatar_url
  };
  if (req.user) {
    let user;
    try {
      const data = await pgQuery(`UPDATE users SET github=$1, profile=jsonb_set(profile, '{ github }', $2),
        tokens = jsonb_set(tokens, '{ github }', $3) 
        WHERE id=$4
        AND 
        github IS NULL
        RETURNING *;`, [profile.id,
        JSON.stringify(_profile),
        JSON.stringify(accessToken),
        req.user.id
      ]);
      user = data.rows[0];
    } catch (e) {
      return done(e);
    }
    if (user) {
      return done(null, user);
    } else {
      req.flash('error', 'There is already a GitHub account that belongs to the logged in user');
      return done(null, false);
    }
  } else {
    let user;
    try {
      const data = await pgQuery(`UPDATE users SET github = $1, tokens=jsonb_set(tokens, '{github}', $2), 
        profile=jsonb_set(profile, '{github}', $3)
        WHERE 
        github = $1
        OR
        email = $4
        RETURNING *;`, [profile.id,
        JSON.stringify(accessToken),
        JSON.stringify(_profile),
        email
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
        const data = await pgQuery('INSERT INTO users ( email, github, tokens, profile, name ) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
          [
            email,
            profile.id,
            JSON.stringify({ github: accessToken }),
            JSON.stringify({ github: _profile }),
            _profile.name
          ]);
        user = data.rows[0];
      } catch (e) {
        return done(e);
      }
      return done(null, user);
    }
  }
}));

module.exports = passport;
