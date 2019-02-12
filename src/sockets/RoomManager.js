const Room = require('./Room');

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
    this.rooms.forEach(room => room.removeUser(client));
  }

  getRoomByName (roomName) {
    return this.rooms.get(roomName);
  }

  serializeRooms () {
    return [...this.rooms.values()].map(room => room.serialize());
  }
}

module.exports = new RoomManager();
