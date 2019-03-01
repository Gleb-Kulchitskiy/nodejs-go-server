class ClientManager {
  constructor () {
    this.clients = new Map();
  }

  addClient (client) {
    this.clients.set(client.id, { id: client.id, client });
  }

  addUser (user) {
    this.clients.set(user.id, { id: null, client: null, user });
  }

  registerClient (client, user) {
    this.clients.set(client.id, { id: client.id, client, user });
  }

  removeClient (client) {
    return this.clients.delete(client.id);
  }

  getAvailableUsers () {
    return [...this.clients.values()]
      .filter(client => client.user)
      .map(client => client.user.id);
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

  getUserByUserId (id) {
    return this.clients.values()
      .filter(data => data.user.id === id)[0];
  }

  serialize () {
    return [...this.clients.values()];
  }
}

module.exports = new ClientManager();
