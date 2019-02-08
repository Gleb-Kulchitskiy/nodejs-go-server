const sinon = require('sinon');
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;

const clientManager = require('../sockets/ClientManager');
const roomManager = require('../sockets/RoomManager');
const makehandlers = require('../sockets/handlers').makeHandleEvent({ id: 1 }, clientManager, roomManager);
const Room = require('../sockets/Room');

describe('makeHandlers', function () {
  beforeEach(function () {
    clientManager.clients = new Map();
    roomManager.rooms = new Map([['global', new Room('global')]]);
  });
  describe('makeSureExists(getter, rejectionMessage)', function () {
    it('should return a promise', function () {
      const spy = sinon.spy(makehandlers, 'makeSureExists');
      makehandlers.makeSureExists(() => true);
      spy.restore();
      expect(spy.calledOnce).to.be.true;
      expect(spy.returnValues[0]).to.be.an.instanceof(Promise);
    });
    it('if getter returns truth value should resolve getter', async () => {
      const spy = sinon.spy(makehandlers, 'makeSureExists');
      let data = await makehandlers.makeSureExists(() => 1, 'reject message');
      spy.restore();
      expect(spy.calledOnce).to.be.true;
      expect(data).to.be.equal(1);
    });
    it('should reject with rejection message, if getter return false', async () => {
      const spy = sinon.spy(makehandlers, 'makeSureExists');
      await expect(makehandlers.makeSureExists(() => false, 'rejection message')).to.be.rejectedWith('rejection message');
      spy.restore();
      expect(spy.calledOnce, 'should called once').to.be.true;
    });
  });
  describe('makeSureUserLoggedIn(clientId)', function () {
    it('should return user object if user logged in', async () => {
      clientManager.registerClient({ id: 1 }, { name: 'Olga' });
      const spy = sinon.spy(makehandlers, 'makeSureUserLoggedIn');
      await expect(makehandlers.makeSureUserLoggedIn(1)).to.be.become({ name: 'Olga' });
      spy.restore();
      expect(spy.calledOnce).to.be.true;
    });
    it('should return rejected message if user not logged in', async () => {
      const spy = sinon.spy(makehandlers, 'makeSureUserLoggedIn');
      await expect(makehandlers.makeSureUserLoggedIn(1)).to.be.rejectedWith('user did not logged in');
      spy.restore();
      expect(spy.calledOnce).to.be.true;
    });
  });
  describe('makeSureClientExist(clientId)', function () {
    it('should return client object if client connected', async () => {
      clientManager.registerClient({ id: 1 }, { name: 'Ola' });
      const spy = sinon.spy(makehandlers, 'makeSureClientExist');
      await expect(makehandlers.makeSureClientExist(1)).to.become({
        id: 1,
        client: { id: 1 },
        user: { name: 'Ola' }
      });
      spy.restore();
      expect(spy.calledOnce).to.be.true;
    });
    it('should return rejected message client not connected', async () => {
      const spy = sinon.spy(makehandlers, 'makeSureClientExist');
      await expect(makehandlers.makeSureClientExist(1)).to.be.rejectedWith('client do not connected');
      spy.restore();
      expect(spy.calledOnce).to.be.true;
    });
  });
  describe('makeSureValidRoom(roomName)', function () {
    it('should return room by name if room exists', async () => {
      const spy = sinon.spy(makehandlers, 'makeSureValidRoom');
      await expect(makehandlers.makeSureValidRoom('global')).to.become({
        name: 'global',
        history: [],
        members: new Map()
      });
      spy.restore();
      expect(spy.calledOnce).to.be.true;
    });
    it('should throw an "invalid room name: {roomName}" error message if room does not exist', async () => {
      const spy = sinon.spy(makehandlers, 'makeSureValidRoom');
      const roomName = 'fakeName';
      await expect(makehandlers.makeSureValidRoom(roomName)).to.be.rejectedWith(`invalid room name: ${roomName}`);
      spy.restore();
      expect(spy.calledOnce).to.be.true;
    });
  });
  describe('makeSureValidRoomAndUserLoggedIn(roomName)', function () {
    it('should return valid room object if room exist and user object if user logged in', async () => {
      const spy = sinon.spy(makehandlers, 'makeSureValidRoomAndUserLoggedIn');
      clientManager.registerClient({ id: 1 }, { name: 'olga' });
      const client = clientManager.getClientById(1);
      await expect(makehandlers.makeSureValidRoomAndUserLoggedIn('global')).to.become({
        room: {
          name: 'global',
          history: [],
          members: new Map()
        },
        user: { name: 'olga' }
      });
      spy.restore();
      expect(spy.calledOnce).to.be.true;
    });
    it('should reject with "user did not logged in" message if user not logged in', async () => {
      const spy = sinon.spy(makehandlers, 'makeSureValidRoomAndUserLoggedIn');
      await expect(makehandlers.makeSureValidRoomAndUserLoggedIn('global')).to.rejectedWith('user did not logged in');
      spy.restore();
      expect(spy.calledOnce).to.be.true;
    });
    it('should reject with "invalid room name: {roomName}" message, if room does not exist', async () => {
      const spy = sinon.spy(makehandlers, 'makeSureValidRoomAndUserLoggedIn');
      clientManager.registerClient({ id: 1 }, { name: 'olga' });
      const client = clientManager.getClientById(1);
      const roomName = 'fake';
      await expect(makehandlers.makeSureValidRoomAndUserLoggedIn(roomName)).to.be.rejectedWith(`invalid room name: ${roomName}`);
      spy.restore();
      expect(spy.calledOnce).to.be.true;
    });
  });
  describe('makeSureValidRoomAndClientConnected(roomName)', function () {
    it('should return room object and client object if room exist and client connected', async () => {
      const spy = sinon.spy(makehandlers, 'makeSureValidRoomAndClientConnected');
      clientManager.addClient({ id: 1 });
      const client = clientManager.getClientById(1);
      await expect(makehandlers.makeSureValidRoomAndClientConnected('global')).to.become({
        user: client,
        room: {
          name: 'global',
          history: [],
          members: new Map()
        },
      });
      spy.restore();
      expect(spy.calledOnce).to.be.true;
    });
    it('should reject with "invalid room name: {roomName}" message if room is not valid', async () => {
      const spy = sinon.spy(makehandlers, 'makeSureValidRoomAndClientConnected');
      clientManager.addClient({ id: 1 });
      const client = clientManager.getClientById(1);
      const roomName = 'fake';
      await expect(makehandlers.makeSureValidRoomAndClientConnected(roomName)).to.be.rejectedWith(`invalid room name: ${roomName}`);
      spy.restore();
      expect(spy.calledOnce).to.be.true;
    });
    it('should reject with "client do not connected" message if client dont connected', async () => {
      const spy = sinon.spy(makehandlers, 'makeSureValidRoomAndClientConnected');
      await expect(makehandlers.makeSureValidRoomAndClientConnected('global')).to.be.rejectedWith('client do not connected');
      spy.restore();
      expect(spy.calledOnce).to.be.true;
    });
  });
  describe.only('handleEventForLoggedUsers(roomName, createEntry)', function () {
    it('should add entry to the Room, broadcast message to all room members and return room object', async () => {
      const roomName = 'global';
      clientManager.registerClient({ id: 1 }, { name: 'ola' });
      const client = clientManager.getClientById(1);
      const emitSpy = sinon.spy();
      client.emit = emitSpy;
      const broadcastSpy = sinon.spy(Room.prototype, 'broadcastMessage');
      roomManager.getRoomByName('global').addUser(client);
      const createEntry = () => ({ event: `client ${client.id} has joined in to the ${roomName}` });
      const members = new Map().set(client.id, client);
      const spy = sinon.spy(makehandlers, 'handleEventForLoggedUsers');
      await expect(makehandlers.handleEventForLoggedUsers('global', createEntry)).to.become({
        history: ['{user:{name:ola},event:client 1 has joined in to the global}'],
        members: members,
        name: 'global'
      });
      broadcastSpy.restore();
      spy.restore();
      expect(broadcastSpy.calledOnce).to.be.true;
      expect(emitSpy.calledOnce).to.be.true;
      expect(spy.calledOnce).to.be.true;
    });
  });
  describe('handleEventForAllUsers (roomName, createEntry)', function () {
    it('should add entry to the Room, and return room object', async () => {
      const roomName = 'global';
      clientManager.addClient({ id: 1 });
      const client = clientManager.getClientById(1);
      roomManager.getRoomByName('global').addUser(client);
      const createEntry = () => ({ event: `client ${client.id} has joined in to the ${roomName}` });
      const members = new Map().set(client.id, client);
      const spy = sinon.spy(makehandlers, 'handleEventForAllUsers');
      await expect(makehandlers.handleEventForAllUsers('global', createEntry)).to.become({
        history: ['{id:1,client:{id:1},event:client 1 has joined in to the global}'],
        members: members,
        name: 'global'
      });
      spy.restore();
      expect(spy.calledOnce).to.be.true;
    });
  });
});
