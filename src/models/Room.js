class Room {
  constructor (name) {
    this.name = name;
    this.members = new Map();
    this.history = [];
  }

  broadcastMessage ({ type, message }) {
    console.log('-message-', message);
    console.log('-asdasdad-', JSON.parse(message));
    this.members.forEach(member => member.emit(type, message));
  }

  addEntry (entry) {
    this.history.push(entry);
  }

  getHistory () {
    return this.history.slice();
  }

  addUser (client) {
    this.members.set(client.id, client);
  }

  removeUser (client) {
    return this.members.delete(client.id);
  }

  getClient (client) {
    return this.members.get(client.id);
  }

  serialize () {
    return {
      name: this.name,
      numMembers: this.members.size
    };
  }
}

module.exports = Room;
