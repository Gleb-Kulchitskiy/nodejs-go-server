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
      .map(client => client.user.name);
  }

  isUserAvailable (userName) {
    return this.getAvailableUsers().some(name => name === userName);
  }

  getUserByName (userName) {
    return [...this.clients.values()]
      .filter(client => client.user)
      .find(client => client.user.name === userName);
  }

  getUserByClientId (id) {
    return (this.clients.get(id) || {}).user;
  }

  getClientById (id) {
    return this.clients.get(id);
  }
}

module.exports = new ClientManager();
