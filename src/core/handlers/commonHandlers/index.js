class CommonHandlers {

  makeSure (getter, rejectionMessage) {
    return new Promise(function (resolve, reject) {
      const res = getter();
      return res
        ? resolve(res)
        : reject(rejectionMessage);
    });
  }

  makeSureUserLoggedIn ({ client, clientManager }) {
    return this.makeSure(
      () => clientManager.getUserByClientId(client.id),
      'user did not logged in'
    );
  }

  makeSureClientExist ({ client, clientManager }) {
    return this.makeSure(
      () => clientManager.getClientById(client.id),
      'clients do not connected'
    );
  }

  makeSurePlayerIsFree ({ client, gameManager }) {
    return this.makeSure(
      () => !gameManager.getGameByPlayerId(client.id),
      `player id = ${client.id} is playing now`
    );
  }
}

module.exports = CommonHandlers;
