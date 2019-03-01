const CommonHandlers = require('../commonHandlers/index');

class RoomHandleEvents extends CommonHandlers {
  constructor () {
    super();
  }

  makeSureValidRoom ({ roomName, roomManager }) {
    return super.makeSure(
      () => roomManager.getRoomByName(roomName),
      `invalid room name: ${roomName}`
    );
  }

  makeSureValidRoomAndUserLoggedIn ({ roomName, roomManager, client, clientManager }) {
    return Promise.all([
      this.makeSureValidRoom({ roomName, roomManager }),
      super.makeSureUserLoggedIn({ client, clientManager })
    ])
      .then(([room, user]) => Promise.resolve({ room, user }));
  }

  makeSureValidRoomAndClientConnected ({ roomName, roomManager, clientManager, client }) {
    return Promise.all([
      this.makeSureValidRoom({ roomName, roomManager }),
      super.makeSureClientExist({ client, clientManager })
    ])
      .then(([room, user]) => Promise.resolve({ room, user }));
  }

  handleEventForLoggedUsers ({ roomName, createEntry, roomManager, client, clientManager }) {
    return this.makeSureValidRoomAndUserLoggedIn({ roomName, roomManager, client, clientManager })
      .then(function ({ room, user }) {
        const entry = JSON.stringify({ userId: user.id, ...createEntry() }).replace(/[\"]/g, '');
        room.addEntry(entry);
        room.broadcastMessage(`roomName: ${roomName}, ${entry}`);
        return room;
      });
  }

  handleEventForAllUsers ({ roomName, createEntry, client, roomManager, clientManager }) {
    return this.makeSureValidRoomAndClientConnected({ roomName, roomManager, clientManager, client })
      .then(function ({ room }) {
        const entry = JSON.stringify({ ...createEntry() }).replace(/[\"]/g, '');
        room.addEntry(entry);
        return room;
      });
  }
}
;

class RoomHandlers extends RoomHandleEvents {
  constructor () {
    super();
  }

  handleJoin ({ client, roomManager, clientManager }) {
    return (roomName, callback) => {
      const createEntry = () => ({ event: `client ${client.id} has joined in to the ${roomName} channel` });
      return super.handleEventForLoggedUsers({ roomName, createEntry, client, roomManager, clientManager })
        .then(function (room) {
          room.addUser(client);
          callback(null, room.getHistory());
        })
        .catch(callback);
    };
  }

  handleLeave ({ client, roomManager, clientManager }) {
    return (roomName, callback) => {
      const createEntry = () => ({ event: `client ${client.id} has left the ${roomName} channel` });
      return super.handleEventForAllUsers({ roomName, createEntry, client, roomManager, clientManager })
        .then(function (room) {
          room.removeUser(client);
          callback(null);
        })
        .catch(callback);
    };
  }

  handleMessage ({ roomManager, client, clientManager }) {
    return ({ roomName, message } = {}, callback) => {
      const createEntry = () => ({ message });
      return super.handleEventForLoggedUsers({ roomName, createEntry, roomManager, client, clientManager })
        .then(() => callback(null))
        .catch(callback);
    };
  }

  handlePrivate ({ client, clientManager }) {
    return ({ receiverClientId, message } = {}, callback) => {
      return Promise.all([
        super.makeSureUserLoggedIn({ client: { id: receiverClientId }, clientManager }),
        super.makeSureUserLoggedIn({ client, clientManager })
      ])
        .then(() => {
          const receiver = clientManager.getClientById(receiverClientId);
          client.emit('message', message);
          receiver.emit('message', message);

        })
        .catch(callback);
    };
  }

  handleGetRooms ({ roomManager }) {
    return (_, callback) => {
      return callback(null, roomManager.serializeRooms());
    };
  }

  handleGetAvailableUsers ({ clientManager }) {
    return (_, callback) => {
      return callback(null, clientManager.getAvailableUsers());
    };
  }

  handleDisconnect ({ client, roomManager, clientManager }) {
    return clientManager.removeClient(client) && roomManager.removeClient(client);
  }
};

module.exports = RoomHandlers;