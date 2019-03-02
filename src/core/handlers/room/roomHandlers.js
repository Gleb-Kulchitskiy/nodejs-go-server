const CommonHandlers = require('../commonHandlers/index');
const { each } = require('awaity');

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

  handleEventWithLoggedUser ({ roomName, createLogEntry, createEntryForClient, roomManager, client, clientManager, type }) {
    return this.makeSureValidRoomAndUserLoggedIn({ roomName, roomManager, client, clientManager })
      .then(function ({ room }) {
        room.addEntry(JSON.stringify(createLogEntry()));
        room.broadcastMessage({ type, message: JSON.stringify({ roomName: roomName, entry: createEntryForClient() }) });
        return room;
      });
  }

  handleEventForAllUsers ({ roomName, createEntry, client, roomManager, clientManager }) {
    return this.makeSureValidRoomAndClientConnected({ roomName, roomManager, clientManager, client })
      .then(function ({ room }) {
        const entry = JSON.stringify({ ...createEntry() });
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

  handleJoinLoggedUser ({ client, user, roomManager, clientManager }) {
    return (roomName, callback) => {
      const createLogEntry = () => ({ event: `user id ${user.id} has joined in to the ${roomName} channel` });
      const createEntryForClient = () => ({ event: `user ${user.name} has joined in to the ${roomName} channel` });
      return super.handleEventWithLoggedUser({
        roomName,
        createLogEntry,
        createEntryForClient,
        client,
        roomManager,
        clientManager,
        type: 'serviceMessage'
      })
        .then(function (room) {
          room.addUser(client);
          callback(null, room.getHistory());
        })
        .catch(callback);
    };
  }

  handleJoin ({ client, roomManager, clientManager }) {
    return (roomName, callback) => {
      const createEntry = () => ({ event: `client ${client.id} has joined in to the ${roomName} channel` });
      return super.handleEventWithLoggedUser({ roomName, createEntry, client, roomManager, clientManager })
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
      const user = clientManager.getUserByClientId(client.id);
      const createLogEntry = () => ({ event: `user id ${user.id} has send the message: ${message} to the ${roomName} channel` });
      const createEntryForClient = () => ({ user, message });
      return super.handleEventWithLoggedUser({
        roomName,
        createLogEntry,
        createEntryForClient,
        roomManager,
        client,
        clientManager,
        type: 'message'
      })
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

  async handleDisconnect ({ client, roomManager, clientManager }) {
    const user = clientManager.getUserByClientId(client.id);
    if (user) {
      const rooms = roomManager.getRooms()
        .filter(room => {
          return room.getClient(client);
        });
      await each(rooms, async (room) => {
        const createLogEntry = () => ({ event: `user id ${user.id} has leave the ${room.name} channel` });
        const createEntryForClient = () => ({ event: `user ${user.name} has leave the ${room.name} channel` });
        await super.handleEventWithLoggedUser({
          roomName: room.name,
          createLogEntry,
          createEntryForClient,
          roomManager,
          client,
          clientManager,
          type: 'serviceMessage'
        })
          .then(() => {
            room.removeUser(client);
          });
      });

      const isRemoved = roomManager.getRooms()
        .filter(room => {
          return room.getClient(client);
        }).length === 0;
      console.log('-is removed-', isRemoved);
      return isRemoved && clientManager.removeClient(client);
    }
    else {
      console.log('-do not logged in-',);
    }
  }
};

module.exports = RoomHandlers;