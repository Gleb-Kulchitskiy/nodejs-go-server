const Game = require('../../models/Game');
const EventEmitter = require('events');
var uniqid = require('uniqid');
const roomHendlers = require('../handlers/room/roomHandlers');

class GameManager extends EventEmitter {
  constructor () {
    super();
    this.games = new Map();
  }

  getGameById (id) {
    return this.games.get(id);
  }

  getGameByPlayerId (playerId) {
    return this.getGames()
      .find(game => {
        return playerId === game.getBlackPlayer() || playerId === game.getWhitePlayer();
      });
  }

  getGames () {
    return [...this.games.values()];
  }

  addGame ({ id, type, player1, player2, room, size }) {
    this.games.set(id, new Game({ id, type, player1, player2, room, size }));
  }

  startNewGame ({ type, player1, player2, size, roomManager, clientManager, handleEventForAllUsers }) {
    const id = uniqid();
    roomManager.addRoom(id);
    const gameRoom = roomManager.getRoomByName(id);
    const createEntry = () => ({ event: `client ${player1.id} has joined in to the ${id} channel` });
    Promise.all([
      handleEventForAllUsers({ id, createEntry, client: { ...player1 }, roomManager, clientManager })
        .then(function (room) {
          room.addUser(player1);
          console.log(room.getHistory());
        }),
      handleEventForAllUsers({ id, createEntry, client: { ...player2 }, roomManager, clientManager })
        .then(function (room) {
          room.addUser(player2);
          console.log(room.getHistory());
        })
        .then(() => ({
          gameRoom,
          id
        }))
    ])
      .then(({ gameRoom, id }) => {
        this.addGame({ id, type, player1, player2, size, room: { ...gameRoom } });
        const game = this.getGameById(id);
        this.emit('startNewGame', ({ id, game, clientManager }));
      })
      .catch(console.log);
  }

  removeGame (id) {
    this.games.delete(id);
  }

  serialize () {
    return [...this.games.values].map(game => game.serialize());
  }
}

const gameManager = new GameManager();

gameManager.on('startNewGame', ({ id, game, clientManager }) => {
  const blackClient = clientManager.getClientById(game.getBlackPlayer());
  const whiteClient = clientManager.getClientById(game.getWhitePlayer());
  blackClient.emit('newGame', game);
  whiteClient.emit('newGame', game);
});

module.exports = gameManager;
