class Game {
  constructor (id, type, player1, player2, room, size) {
    this.gameId = id;
    this.type = type;
    this.white = player1;
    this.black = player2;
    this.room = room.id;
    this.size = size;
    this._round = null;
    this.history = [];
    this.board = this.createDataStrucure(size - 1);
    this.winner = null;
  }

  get round () {
    return this._round;
  }

  set round (color) {
    if ((color === 'white') || (color === 'black')) {
      this._round = color;
    } else {
      return new Error(`a move can only belong to a white or black player, but have ${color} color`);
    }
  }

  getPlayerColor (player) {
    return this.white === player.id
      ? 'white'
      : 'black';
  }

  createDataStrucure (size) {
    const board = new Array(size);
    board.fill(0);
    return board.map(() => {
      return new Array(size).fill(0);
    });
  }

  getRoomId () {
    return this.room;
  }

  getGameId () {
    return this.gameId;
  }

  getWhitePlayer () {
    return this.white;
  }

  getBlackPlayer () {
    return this.black;
  }

  isPointAvailable (x, y) {
    return !this.board[y - 1][x - 1];
  }

  putStone (x, y) {
    this.board[y - 1][x - 1] = this.getRound() === 'black' ? 1 : 2;
  }

  getRound () {
    return this.round;
  }

  switchRound (color) {
    if (color === this.round) {
      throw new Error('Player can not make the move twice in a row.');
    }
    this.round = color;
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
      black: this.black,
      type: this.type,
      size: this.size,
      round: this.round,
      winner: this.winner
    };
  }
}

module.exports = Game;