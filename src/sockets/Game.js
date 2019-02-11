class Game {
  constructor (id, player, room, size) {
    this.gameId = id;
    this.player1 = player;
    this.player2 = null;
    this.white = null;
    this.black = null;
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

  isPointAvailable (x, y) {
    return !this.board[y - 1][x - 1];
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

  putStone (x, y) {
    const isFree = this.isPointAvailable(x, y);
    return isFree
      ? this.board[y - 1][x - 1] = this.getTurn()
      : new Error('the place is busy');
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
}

module.exports = Game;
