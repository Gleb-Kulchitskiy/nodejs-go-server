const Router = require('express-promise-router');
const router = new Router();
const clientManager = require('../../../core/clients/clientManager');
const gameManager = require('../../../core/game/gameManager');
const { query } = require('../../../db/postgresql/index');
const { each } = require('awaity/esm');
const { param, validationResult } = require('express-validator/check');
const { getError } = require('../../../utils/index');

router.get('/', (req, res) => {
  res.render('index', { title: 'Ola', user: req.user });
});

router.get('/login', (req, res) => {
  res.render('login', { message: req.flash('validationError') });
});

router.get('/users', async (req, res) => {
  const usersId = clientManager.serialize()
    .map(obj => obj.user.id);
  const users = [];
  await each(usersId, async (id) => {
    const user = await query('SELECT id, email, name FROM users WHERE id=$1;', [id]);
    users.push(user.rows[0]);
  });
  res.json(users);
});

router.get('/user/:id',
  [param('id', 'id must be a number').isNumeric()],
  (req, res, next) => {
    const result = validationResult(req).array();
    if (result.length) {
      const error = getError(result, 400);
      next(error);
    }
    next();
  }, async (req, res) => {
    const id = req.params.id;
    let user;
    try {
      user = await query('SELECT id, name, email FROM users WHERE id=$1;', [`${id}`]);
    } catch (e) {
      throw e;
    }
    res.json(user.rows[0]);
  });

router.get('/players', (req, res) => {

});

router.get('/games', (req, res) => {
  const games = gameManager.serialize();
  res.json(games);
});

module.exports = router;
