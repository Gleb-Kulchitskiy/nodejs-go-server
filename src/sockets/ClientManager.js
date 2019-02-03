class ClientManager {
  constructor () {
    this.clients = new Map();
  }

  addClient (client) {
    this.clients.set(client.id, { client });
  }

  registerClient (client, user) {
    this.clients.set(client.id, { client, user });
  }

  removeClient (client) {
    this.clients.delete(client.id);
  }

  getAvailableUsers () {
    return [...this.clients.values()]
      .filter(client => client.user)
      .map(user => user.name);
  }

  isUserAvailable (userName) {
    return this.getAvailableUsers().some(user => user.name === userName);
  }

  getUserByName (userName) {
    return [this.clients.values()]
      .filter(client => client.user)
      .find(user => user.name === userName);
  }

  getUserByClientId (client) {
    return (this.clients.get(client.id) || {}).user;
  }

  getClientById (client) {
    return this.clients.get(client.id);
  }
}

module.exports = new ClientManager();
