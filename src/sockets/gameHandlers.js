function makeHandleEvent (client, gameManager) {
  function makeSure (getter, rejectionMessage) {
    return new Promise(function (resolve, reject) {
      const res = getter();
      return res
        ? resolve(res)
        : reject(rejectionMessage);
    });
  }

  function makeSurePlayersAssigned (game) {
    return makeSure(
      () => {
        const white = game.getWhitePlayer();
        const black = game.getBlackPlayer();
        return black && white;
      },
      'players are not assigned'
    );
  }

  function makeSurePlayerIsFree (client) {
    return makeSure(
      () => !gameManager.getGameByPlayerId(client.id),
      `player is playing now`
    );
  }

  function makeSureCurrentPlayersRoung (game) {
    return makeSure(
      () => game.getRound() === game.getPlayerColor(client),
      `now opponent's turn`
    );
  }

  function makeSureUserIsPlaysGame (game) {
    return makeSure(
      () => game.getWhitePlayer() === client.id || game.getBlackPlayer() === client.id,
      `the player does not play the game id = ${game.id}`
    );
  }

  function makeSureRoomIsAssigned (game) {
    makeSure(
      () => !!game.getRoomId(),
      'room is not assigned to the game'
    );
  }

  function makeSurePointAvailable (game, x, y) {
    return makeSure(
      () => game.isPointAvailable(x, y),
      'point is busy'
    );
  }

}
