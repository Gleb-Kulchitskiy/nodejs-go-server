const CommonHandlers = require('../commonHandlers/index');

class gameHandlerEvents extends CommonHandlers {

  makeSurePlayersAssigned (game) {
    return super.makeSure(
      () => {
        const white = game.getWhitePlayer();
        const black = game.getBlackPlayer();
        return black && white;
      },
      'players are not assigned'
    );
  }

  makeSureCurrentPlayersRound (game, client) {
    return super.makeSure(
      () => game.getRound() === game.getPlayerColor(client),
      `now opponent's turn`
    );
  }

  makeSureUserIsPlayingNow (game, client) {
    return super.makeSure(
      () => game.getWhitePlayer() === client.id || game.getBlackPlayer() === client.id,
      `the player does not play the game id = ${game.id}`
    );
  }

  makeSureRoomIsAssigned (game) {
    return super.makeSure(
      () => !!game.getRoomId(),
      'room is not assigned to the game'
    );
  }

  makeSurePointAvailable (game, x, y) {
    return super.makeSure(
      () => game.isPointAvailable(x, y),
      'point is busy'
    );
  }

}

class GameHandlers extends gameHandlerEvents {

  handleMakeInvite (opponentId, callback) {
  }

  handleInvite ({ client, gameManager, roomManager, clientManager, handleEventForLoggedUsers }) {
    return ({ opponentId, callback }) => {
      Promise.all([
        super.makeSureClientExist({ client: { id: opponentId }, clientManager }),
        super.makeSureUserLoggedIn({ client: { id: opponentId }, clientManager }),
        super.makeSureUserLoggedIn({ client, clientManager })
      ])
        .then(([opponentData]) => {
          return Promise.all([
            super.makeSurePlayerIsFree(opponentId),
            super.makeSurePlayerIsFree(client.id)
          ])
            .then(() => opponentData);
        })
        .then((opponentData) => {
          return new Promise((resolve, reject) => {
            opponentData.client.emit('oniInvite', { id: client.id }, (err, resp) => {
              if (err) reject(err);
              resolve(resp);
            });
          });
        })
        .then(({ accept, type, size }) => {
          if (accept) {
            gameManager.startNewGame({
              type,
              size,
              player1: { client },
              player2: { id: opponentId },
              roomManager,
              clientManager,
              handleEventForLoggedUsers
            });
          }
          callback(null, accept);
        })
        .catch(callback);
    };
  }
}

module.exports = GameHandlers;
