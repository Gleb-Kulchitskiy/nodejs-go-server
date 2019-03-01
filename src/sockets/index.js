const roomManager = require('../core/room/roomManager');
const clientManager = require('../core/clients/clientManager');
const gameManager = require('../core/game/gameManager');
const RoomHandlers = require('../core/handlers/room/roomHandlers');
const GameHandlers = require('../core/handlers/game/gameHandlers');
const roomHandlers = new RoomHandlers();

const gameHandlers = new GameHandlers();

module.exports = function (io, sharedsession, session) {
  io.use(sharedsession(session));
  io.on('connection', (client) => {
    if (client.handshake.session.user) {
      console.log('-have User-',);
      const user = client.handshake.session.user;
      clientManager.registerClient(client, user);
      roomHandlers.handleJoin({ client, roomManager, clientManager })('global', (err, data) => {
        if (err) console.log('-err-', err);
        else {
          console.log('-client has been joined to the Global Room-', data);
        }
      });
    } else {
      console.log('-do not have user-',);
      clientManager.addClient(client);
      roomHandlers.handleJoin({ client, roomManager, clientManager })('global', (err, data) => {
        if (err) console.log('-err-', err);
        else {
          console.log('-client has been joined to the Global Room-', data);
        }
      });
    }
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
      const result = roomHandlers.handleDisconnect({ client, roomManager, clientManager });
      console.log(`client with id = ${client.id} was ${result ? 'successfully' : 'NOT'} removed from the Rooms and/or clientManager`);
    });

    client.on('error', function (err) {
      console.log('received error from clients:', client.id);
      console.log(err);
    });
  });
};
