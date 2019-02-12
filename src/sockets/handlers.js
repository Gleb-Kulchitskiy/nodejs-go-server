function makeHandleEvent (client, clientManager, roomManager) {
  function makeSureExists (getter, rejectionMessage) {
    return new Promise(function (resolve, reject) {
      const res = getter();
      return res
        ? resolve(res)
        : reject(rejectionMessage);
    });
  }

  function makeSureUserLoggedIn (clientId) {
    return makeSureExists(
      () => clientManager.getUserByClientId(clientId),
      'user did not logged in'
    );
  }

  function makeSureClientExist (clientId) {
    return makeSureExists(
      () => clientManager.getClientById(clientId),
      'client do not connected'
    );
  }

  function makeSureValidRoom (roomName) {
    return makeSureExists(
      () => roomManager.getRoomByName(roomName),
      `invalid room name: ${roomName}`
    );
  }

  function makeSureValidRoomAndUserLoggedIn (roomName) {
    return Promise.all([
      makeSureValidRoom(roomName),
      makeSureUserLoggedIn(client.id)
    ])
      .then(([room, user]) => Promise.resolve({ room, user }));
  }

  function makeSureValidRoomAndClientConnected (roomName) {
    return Promise.all([
      makeSureValidRoom(roomName),
      makeSureClientExist(client.id)
    ])
      .then(([room, user]) => Promise.resolve({ room, user }));
  }

  function handleEventForLoggedUsers (roomName, createEntry) {
    return makeSureValidRoomAndUserLoggedIn(roomName)
      .then(function ({ room, user }) {
        const entry = JSON.stringify({ user, ...createEntry() }).replace(/[\"]/g, '');
        room.addEntry(entry);
        room.broadcastMessage(`roomName: ${roomName}, ${entry}`);
        return room;
      });
  }

  function handleEventForAllUsers (roomName, createEntry) {
    return makeSureValidRoomAndClientConnected(roomName)
      .then(function ({ room, user }) {
        const entry = JSON.stringify({ ...user, ...createEntry() }).replace(/[\"]/g, '');
        room.addEntry(entry);
        return room;
      });
  }

  return {
    makeSureExists,
    makeSureClientExist,
    makeSureValidRoom,
    makeSureValidRoomAndUserLoggedIn,
    makeSureValidRoomAndClientConnected,
    handleEventForLoggedUsers,
    handleEventForAllUsers,
    makeSureUserLoggedIn
  };
};

function handlers (client, clientManager, roomManager) {
  const {
    handleEventForLoggedUsers,
    handleEventForAllUsers,
    makeSureUserLoggedIn
  } = makeHandleEvent(client, clientManager, roomManager);

  function handleJoin (roomName, callback) {
    const createEntry = () => ({ event: `client ${client.id} has joined in to the ${roomName} channel` });

    return handleEventForAllUsers(roomName, createEntry)
      .then(function (room) {
        room.addUser(client);
        callback(null, room.getHistory());
      })
      .catch(callback);
  }

  function handleLeave (roomName, callback) {
    const createEntry = () => ({ event: `client ${client.id} has left the ${roomName} channel` });
    return handleEventForAllUsers(roomName, createEntry)
      .then(function (room) {
        room.removeUser(client);
        callback(null);
      })
      .catch(callback);
  }

  function handleMessage ({ roomName, message } = {}, callback) {
    const createEntry = () => ({ message });
    return handleEventForLoggedUsers(roomName, createEntry)
      .then(() => callback(null))
      .catch(callback);
  }

  function handlePrivate ({ receiverClientId, message } = {}, callback) {
    return Promise.all([
      makeSureUserLoggedIn(receiverClientId),
      makeSureUserLoggedIn(client.id)
    ])
      .then(() => {
        const receiver = clientManager.getClientById(receiverClientId);
        client.emit('message', message);
        receiver.emit('message', message);

      })
      .catch(callback);
  }

  function handleGetRooms (_, callback) {
    return callback(null, roomManager.serializeRooms());
  }

  function handleGetAvailableUsers (_, callback) {
    return callback(null, clientManager.getAvailableUsers());
  }

  function handleDisconnect () {
    clientManager.removeClient(client);
    roomManager.removeClient(client);
  }

  return {
    handlePrivate,
    handleJoin,
    handleLeave,
    handleMessage,
    handleGetRooms,
    handleGetAvailableUsers,
    handleDisconnect
  };
};

module.exports = {
  makeHandleEvent,
  handlers
};