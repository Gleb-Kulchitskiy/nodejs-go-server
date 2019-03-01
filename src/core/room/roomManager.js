const Room = require('../../models/Room');

class RoomManager {

  constructor () {
    this.rooms = new Map([['global', new Room('global')]]);
  }

  addRoom (roomName) {
    this.rooms.set(roomName, new Room(roomName));
  }

  removeRoom (roomName) {
    this.rooms.delete(roomName);
  }

  removeClient (client) {
    return [...this.rooms.values()]
      .filter(room => {
        return room.getClient(client);
      })
      .every(room => room.removeUser(client));
  }

  getRoomByName (roomName) {
    return this.rooms.get(roomName);
  }

  serializeRooms () {
    return [...this.rooms.values()].map(room => room.serialize());
  }
}

module.exports = new RoomManager();
