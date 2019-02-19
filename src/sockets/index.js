const roomManager = require('../core/room/roomManager');
const clientManager = require('../core/clients/clientManager');
const gameManager = require('../core/game/gameManager');
const RoomHandlers = require('../core/handlers/room/roomHandlers');
const GameHandlers = require('../core/handlers/game/gameHandlers');

const {
  handleJoin,
  handleLeave,
  handleMessage,
  handlePrivate,
  handleGetRooms,
  handleGetAvailableUsers,
  handleDisconnect,
  handleEventForAllUsers,
  handleEventForLoggedUsers
} = new RoomHandlers();

const {
  handleInvite
} = new GameHandlers();

module.exports = function (io) {
  io.on('connection', (client) => {
    clientManager.addClient(client);

    client.on('message', handleMessage({ client, roomManager, clientManager }));

    client.on('private', handlePrivate({ client, clientManager }));

    client.on('join', handleJoin({ client, roomManager, clientManager }));

    client.on('leave', handleLeave({ client, roomManager, clientManager }));

    client.on('rooms', handleGetRooms({ roomManager }));

    client.on('availableUsers', handleGetAvailableUsers({ clientManager }));

    client.on('invite', handleInvite({
      client,
      gameManager,
      roomManager,
      clientManager,
      handleEventForLoggedUsers
    }));

    client.on('disconnect', function () {
      console.log('clients disconnect...', client.id);
      handleDisconnect({ client, roomManager, clientManager });
    });

    client.on('error', function (err) {
      console.log('received error from clients:', client.id);
      console.log(err);
    });
  });
};
