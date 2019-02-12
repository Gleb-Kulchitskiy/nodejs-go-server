const Game = require('Game');

class GameManager {
  constructor () {
    this.games = new Map();
  }

  getGameById (id) {
    return this.games.get(id);
  }

  getGames () {
    const map = {};
    this.games.forEach((val, key) => {
      map[key] = val;
    });
    return map;
  }

  addGame (id, player1, player2, room, size) {
    this.games.set(id, new Game(id, player1, player2, room, size));
  }

  removeGame (id) {
    this.games.delete(id);
  }

  serialize () {
    return [...this.games.values].map((game) => game.serialize());
  }

}

module.exports = new GameManager();
