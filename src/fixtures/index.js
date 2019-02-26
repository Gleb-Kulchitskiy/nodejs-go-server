const { query } = require('../db/postgresql');
const { each } = require('awaity/esm');
const users = require('./users');

async function init () {
  try {
    await query('DROP TABLE IF EXISTS users CASCADE;');
    await query(`CREATE TABLE users(
   id serial PRIMARY KEY,
   name VARCHAR (50) NOT NULL,
   email VARCHAR(50) NOT NULL UNIQUE,
   password VARCHAR(240),
   facebook VARCHAR (50) DEFAULT NULL,
   github VARCHAR (50) DEFAULT NULL,
   twitter VARCHAR (50) DEFAULT NULL,
   tokens jsonb,
   profile jsonb,
   created_on timestamp with time zone NOT NULL DEFAULT now()
   );`);

    await query(`DROP TABLE IF EXISTS players_statistics;`);
    await query(`CREATE TABLE players_statistics(
    id serial PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    win INTEGER,
    loss INTEGER,
    rank INTEGER
    );`);
    await each(users, async ({ name, email, password, profile, tokens }) => {
      await query(
        `INSERT INTO users (name,email,password, tokens,profile) 
        VALUES ($1,$2,$3,$4,$5);`,
        [name, email, password, JSON.stringify(tokens), JSON.stringify(profile)]
      );
    });
  } catch (e) {
    console.log('-e-', e);
  }
}

module.exports = init();
