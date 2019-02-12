const { passwordHash } = require('../utils');

const users = [
  {
    name: 'Ivan',
    email: 'ivan@gmail.com',
    password: passwordHash('12345'),
    facebook: '',
    github: '',
    twitter: '',
    tokens: '',
    profile: ''
  },
  {
    name: 'Olga',
    email: 'olga@gmail.com',
    password: passwordHash('12345'),
    facebook: '',
    github: '',
    twitter: '',
    tokens: '',
    profile: ''
  },
  {
    name: 'Timur',
    email: 'timur@gmail.com',
    password: passwordHash('12345'),
    facebook: '',
    github: '',
    twitter: '',
    tokens: '',
    profile: ''
  },
  {
    name: 'Anna',
    email: 'anna@gmail.com',
    password: passwordHash('12345'),
    facebook: '',
    github: '',
    twitter: '',
    tokens: '',
    profile: ''
  },
  {
    name: 'Fedor',
    email: 'fedor@gmail.com',
    password: passwordHash('12345'),
    facebook: '',
    github: '',
    twitter: '',
    tokens: '',
    profile: ''
  }
];
module.exports = users;
