class Game {
  constructor (id, player1, player2, room, size) {
    this.gameId = id;
    this.white = player1;
    this.black = player2;
    this.room = room.id;
    this.size = size;
    this.turn = null;
    this.history = [];
    this.board = this.createDataStrcure(size - 1);
  }

  createDataStrcure (size) {
    const board = new Array(size);
    board.fill(0);
    return board.map(() => {
      return new Array(size).fill(0);
    });
  };

  getGameId () {
    return this.gameId;
  }

  getWjitePlayer () {
    return this.white;
  }

  getBlackPlayer () {
    return this.black;
  }

  isPointAvailable (x, y) {
    return !this.board[y - 1][x - 1];
  }

  putStone (x, y) {
    const isFree = this.isPointAvailable(x, y);
    return isFree
      ? this.board[y - 1][x - 1] = this.getTurn()
      : new Error('the place is busy');
  }

  getTurn () {
    return this.turn === 'white'
      ? 1
      : 2;
  }

  switchTurn (color) {
    if (color === this.turn) {
      throw new Error('Player can not make the move twice in a row.');
    }
    this.turn = color;
  }

  setColor (color, player) {
    if (color !== 'white' || color !== 'black') {
      throw new Error('color must be white or back');
    }
    this[color] = player;
  }

  setOpponentPlayer (player) {
    this.player2 = player;
  }

  serialize () {
    return {
      gameId: this.gameId,
      white: this.white,
      black: this.black
    };
  }
}

module.exports = Game;
