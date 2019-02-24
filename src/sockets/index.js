const roomManager = require('../core/room/roomManager');
const clientManager = require('../core/clients/clientManager');
const gameManager = require('../core/game/gameManager');
const RoomHandlers = require('../core/handlers/room/roomHandlers');
const GameHandlers = require('../core/handlers/game/gameHandlers');

const roomHandlers = new RoomHandlers();

const gameHandlers = new GameHandlers();

module.exports = function (io) {
  io.on('connection', (client) => {
    clientManager.addClient(client);

    client.on('message', roomHandlers.handleMessage({ client, roomManager, clientManager }));

    client.on('private', roomHandlers.handlePrivate({ client, clientManager }));

    client.on('join', roomHandlers.handleJoin({ client, roomManager, clientManager }));

    client.on('leave', roomHandlers.handleLeave({ client, roomManager, clientManager }));

    client.on('rooms', roomHandlers.handleGetRooms({ roomManager }));

    client.on('availableUsers', roomHandlers.handleGetAvailableUsers({ clientManager }));

    client.on('invite', gameHandlers.handleInvite({
      client,
      gameManager,
      roomManager,
      clientManager,
      roomHandlers
    }));

    client.on('disconnect', function () {
      console.log('clients disconnect...', client.id);
      roomHandlers.handleDisconnect({ client, roomManager, clientManager });
    });

    client.on('error', function (err) {
      console.log('received error from clients:', client.id);
      console.log(err);
    });
  });
};
