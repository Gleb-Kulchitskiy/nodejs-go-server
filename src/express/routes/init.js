const Router = require('express-promise-router');
const router = new Router();
const clientManager = require('../../sockets/ClientManager');

router.get('/users', (req, res) => {
  const users = clientManager.serialize();
  res.json(users);
});

router.get('/user:id', (req, res) => {
  //todo
});

router.get('/games', (req, res) => {
// todo
});




module.exports = router;
