const roomManager = require('./RoomManager');
const clientManager = require('./ClientManager');
const { handlers } = require('./handlers');

module.exports = function (io) {
  io.on('connection', (client) => {
    const {
      handleJoin,
      handleLeave,
      handleMessage,
      handlePrivate,
      handleGetRooms,
      handleGetAvailableUsers,
      handleDisconnect
    } = handlers(client, roomManager, clientManager);

    clientManager.addClient(client);

    client.on('message', handleMessage);

    client.on('private', handlePrivate);

    client.on('join', handleJoin);

    client.on('leave', handleLeave);

    client.on('rooms', handleGetRooms);

    client.on('availableUsers', handleGetAvailableUsers);

    client.on('disconnect', function () {
      console.log('client disconnect...', client.id);
      handleDisconnect();
    });

    client.on('error', function (err) {
      console.log('received error from client:', client.id);
      console.log(err);
    });

  });
};
