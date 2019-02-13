const Game = require('./Game');

class GameManager {
  constructor () {
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

  addGame (id, type, player1, player2, room, size) {
    this.games.set(id, new Game(id, type, player1, player2, room, size));
  }

  removeGame (id) {
    this.games.delete(id);
  }

  serialize () {
    return [...this.games.values].map((game) => game.serialize());
  }


}

module.exports = new GameManager();
