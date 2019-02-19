const Router = require('express-promise-router');
const router = new Router();
const clientManager = require('../../core/clients/clientManager');
const gameManager = require('../../core/game/gameManager');
const { query } = require('../../db/postgresql');
const { each } = require('awaity/esm');
const { param, validationResult } = require('express-validator/check');
const { getError } = require('../../utils');

router.get('/users', async (req, res) => {
  const usersId = clientManager.serialize()
    .map(obj => obj.user.id);
  const users = [];
  await each(usersId, async (id) => {
    const user = await query('SELECT (id, email, name) FROM users WHERE id=$1;', [id]);
    users.push(user.rows[0]);
  });
  res.json(users);
});

router.get('/user:id',
  (req, res, next) => {
    param('id', 'id must be a number').isDecimal();
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
      user = await query('SELECT FROM users (id, name, email) WHERE id=$1;', [id]);
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
