const { query } = require('../db/postgresql');
const { each } = require('awaity/esm');
const users = require('./users');

async function init () {
  try {
    await query('DROP TABLE IF EXISTS users;');
    await query(`CREATE TABLE users(
   id serial PRIMARY KEY,
   name VARCHAR (50) NOT NULL,
   email VARCHAR(50) NOT NULL UNIQUE,
   password VARCHAR(240),
   facebook VARCHAR (50),
   github VARCHAR (50),
   twitter VARCHAR (50),
   tokens VARCHAR (50),
   profile jsonb,
   created_on timestamp with time zone NOT NULL DEFAULT now()
   );`);

    await each(users, async ({ name, email, password, facebook, twitter, github, profle, tokens }) => {
      await query(
        `INSERT INTO users (name,email,password,facebook,github,twitter,tokens,profile) 
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8);`,
        [name, email, password, facebook, github, twitter, tokens, profle]
      );
    });
  } catch (e) {
    console.log('-e-', e);
  }
}

module.exports = init();