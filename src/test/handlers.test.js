const sinon = require('sinon');
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const _ = require('lodash');
const util = require('util');

const clientM = require('../sockets/ClientManager');
const roomM = require('../sockets/RoomManager');
const Room = require('../sockets/Room');
const mainHandlers = require('../sockets/roomHandlers').roomHandlers;

describe('handlers', function () {
  let handlers;
  let client;
  let clientManager;
  let roomManager;
  beforeEach(function () {
    clientManager = _.cloneDeep(clientM);
    clientManager.registerClient({ id: 1 }, { name: 'Ola' });
    roomManager = _.cloneDeep(roomM);
    client = clientManager.getClientById(1);
    handlers = mainHandlers(client, clientManager, roomManager);
  });
  describe('handleJoin (roomName, callback)', function () {
    it('should add entry to the room history', async () => {
      const spy = sinon.spy(handlers, 'handleJoin');
      const roomName = 'global';
      await handlers.handleJoin(roomName, (err, message) => {
        if (err) console.log('-err-', err);
      });
      spy.restore();
      expect(spy.calledOnce).to.be.true;
      await expect(roomManager.getRoomByName('global').history[0]).to.be.equal(
        JSON.stringify({
          id: 1,
          client: { id: 1 },
          user: { name: 'Ola' },
          event: `client ${client.id} has joined in to the ${roomName} channel`
        }).replace(/[\"]/g, ''));
    });
    it('should add user to the room, and call callback with message', async () => {
      const globalRoomSize = roomManager.getRoomByName('global').members.size;
      const addUserSpy = sinon.spy(Room.prototype, 'addUser');
      const spy = sinon.spy(handlers, 'handleJoin');
      const callback = sinon.spy();
      await handlers.handleJoin('global', callback);
      addUserSpy.restore();
      spy.restore();
      expect(callback.calledOnce).to.be.true;
      expect(callback.getCall(0).args[0]).to.be.null;
      expect(callback.getCall(0).args[1]).to.be.deep.equal(
        ['{id:1,client:{id:1},user:{name:Ola},event:client 1 has joined in to the global channel}']);
      expect(roomManager.getRoomByName('global').members.size).to.be.equal(globalRoomSize + 1);
      expect(spy.calledOnce).to.be.true;
      expect(addUserSpy.calledOnce).to.be.true;
    });
    it('should call the callback with "errorMessage" if error occur', async () => {
      const globalRoomSize = roomManager.getRoomByName('global').members.size;
      const addUserSpy = sinon.spy(Room.prototype, 'addUser');
      const spy = sinon.spy(handlers, 'handleJoin');
      const callback = sinon.spy();
      const roomName = 'fake';
      await handlers.handleJoin(roomName, callback);
      addUserSpy.restore();
      spy.restore();
      expect(callback.calledOnce).to.be.true;
      expect(callback.getCall(0).args[0]).to.be.equal(`invalid room name: ${roomName}`);
      expect(callback.getCall(0).args[1]).to.be.undefined;
      expect(roomManager.getRoomByName('global').members.size).to.be.equal(globalRoomSize);
      expect(spy.callCount).to.be.equal(1);
      expect(addUserSpy.callCount).to.be.equal(0);
    });
  });
  describe('handleLeave (roomName, callback)', function () {
    it('should add entry to the room history', async () => {
      const spy = sinon.spy(handlers, 'handleLeave');
      const roomName = 'global';
      const callback = sinon.spy();
      const callback1 = sinon.spy();
      await handlers.handleJoin(roomName, callback);
      await handlers.handleLeave(roomName, callback1);
      spy.restore();
      expect(spy.calledOnce).to.be.true;
      expect(callback.calledOnce).to.be.true;
      expect(callback1.calledOnce).to.be.true;
      await expect(roomManager.getRoomByName('global').history[1]).to.be.equal(
        JSON.stringify({
          id: 1,
          client: { id: 1 },
          user: { name: 'Ola' },
          event: `client ${client.id} has left the ${roomName} channel`
        }).replace(/[\"]/g, ''));
    });
    it('should remove user from the room, and call callback with null', async () => {
      const roomName = 'global';
      const callback = sinon.spy();
      await handlers.handleJoin(roomName, () => {
      });
      const globalRoomSize = roomManager.getRoomByName(roomName).members.size;
      const removeUserSpy = sinon.spy(Room.prototype, 'removeUser');
      const spy = sinon.spy(handlers, 'handleLeave');
      await handlers.handleLeave(roomName, callback);
      removeUserSpy.restore();
      spy.restore();
      expect(callback.calledOnce).to.be.true;
      expect(callback.getCall(0).args[0]).to.be.null;
      expect(callback.getCall(0).args[1]).to.be.undefined;
      expect(roomManager.getRoomByName('global').members.size).to.be.equal(globalRoomSize - 1);
      expect(spy.calledOnce).to.be.true;
      expect(removeUserSpy.calledOnce).to.be.true;
    });
    it('should call the callback with "errorMessage" if error occur', async () => {
      const globalRoomSize = roomManager.getRoomByName('global').members.size;
      const addUserSpy = sinon.spy(Room.prototype, 'removeUser');
      const spy = sinon.spy(handlers, 'handleLeave');
      const callback = sinon.spy();
      const roomName = 'fake';
      await handlers.handleLeave(roomName, callback);
      addUserSpy.restore();
      spy.restore();
      expect(callback.calledOnce).to.be.true;
      expect(callback.getCall(0).args[0]).to.be.equal(`invalid room name: ${roomName}`);
      expect(callback.getCall(0).args[1]).to.be.undefined;
      expect(roomManager.getRoomByName('global').members.size).to.be.equal(globalRoomSize);
      expect(spy.callCount).to.be.equal(1);
      expect(addUserSpy.callCount).to.be.equal(0);
    });
  });
  describe('handleMessage ({ roomName, message } = {}, callback)', function () {
    it('should push entry to the history and broadcast message to all logged users in room', async () => {
      const handleMessageSpy = sinon.spy(handlers, 'handleMessage');
      const roomName = 'global';
      const message = 'just message';
      const historySize = roomManager.getRoomByName(roomName).history.length;
      const emitSpy = sinon.spy();
      client.emit = emitSpy;
      roomManager.getRoomByName(roomName).addUser(client);
      await handlers.handleMessage({ roomName, message }, () => {
      });
      expect(handleMessageSpy.calledOnce).to.be.true;
      expect(emitSpy.calledOnce).to.be.true;
      expect(roomManager.getRoomByName(roomName).history.length).to.be.equal(historySize + 1);
    });
  });
});
