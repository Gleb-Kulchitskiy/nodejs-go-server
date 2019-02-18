const expect = require('chai').expect;
const sinon = require('sinon');
const _ = require('lodash');

const roomManager = require('../core/room/roomManager');
const Room = require('../models/Room');

describe('roomManager', function () {
  beforeEach(function () {
    roomManager.rooms = new Map([['global', new Room('global')]]);
  });
  describe('roomManager fields', function () {
    it('should have one property called "rooms"', function () {
      expect(Object.keys(roomManager).length).to.be.equal(1);
      expect(roomManager).to.have.own.property('rooms');
    });

    it('should be an object instanceOf Map', function () {
      expect(roomManager[Object.keys(roomManager)[0]]).to.be.an.instanceOf(Map);
    });
  });
  describe('addRoom', function () {
    it('should increase the size of the room object by 1', function () {
      const roomsSize = roomManager.rooms.size;
      const spy = sinon.spy(roomManager, 'addRoom');
      roomManager.addRoom('test');
      sinon.assert.calledOnce(spy);
      spy.restore();
      expect(roomManager.rooms.size).to.be.equal(roomsSize + 1);
    });
    it('the added value must be an instance of the room', function () {
      const spy = sinon.spy(roomManager, 'addRoom');
      roomManager.addRoom('test');
      sinon.assert.calledOnce(spy);
      spy.restore();
      expect(roomManager.rooms.get('test')).to.be.an.instanceOf(Room);
    });
    it('new key of the added entity should be equal to the name of the argument', function () {
      const spy = sinon.spy(roomManager, 'addRoom');
      roomManager.addRoom('test');
      sinon.assert.calledOnce(spy);
      spy.restore();
      expect(roomManager.rooms.get('test')).to.be.an('object');
    });
  });
  describe('removeRoom', function () {
    it('should remove Room object from rooms by name', function () {
      roomManager.addRoom('test');
      const roomsSize = roomManager.rooms.size;
      const spy = sinon.spy(roomManager, 'removeRoom');
      roomManager.removeRoom('test');
      spy.restore();
      sinon.assert.calledOnce(spy);
      sinon.assert.calledWith(spy, 'test');
      expect(roomManager.rooms.size).to.be.equal(roomsSize - 1);
      expect(roomManager.rooms.get('test')).to.be.undefined;
    });
  });
  describe('removeClient', function () {
    it('should call removeUser on every room', function () {
      const spy = sinon.spy(Room.prototype, 'removeUser');
      roomManager.addRoom('test1');
      roomManager.rooms.get('test1')
        .addUser({ id: 1, client: 'Ura' });
      roomManager.addRoom('test2');
      roomManager.rooms.get('test2')
        .addUser({ id: 1, client: 'Ura' });
      roomManager.removeClient({ id: 1 });
      spy.restore();
      sinon.assert.calledThrice(spy);
      expect(roomManager.rooms.get('test1').members.get('1')).to.be.undefined;
    });
  });
  describe('getRoomByName', function () {
    it('should return room by name', function () {
      const spy = sinon.spy(roomManager, 'getRoomByName');
      roomManager.getRoomByName('global');
      spy.restore();
      sinon.assert.calledWith(spy, 'global');
      expect(spy.getCall(0).args[0]).to.be.equal('global');
      expect(spy.returnValues[0].name).to.be.equal('global');
      expect(spy.returnValues[0]).to.be.an('object');
    });
  });
  describe('serializeRooms', function () {
    it('should call serialize at all rooms', function () {
      const size = roomManager.serializeRooms().length;
      const spy = sinon.spy(Room.prototype, 'serialize');
      const roomManagerSpy = sinon.spy(roomManager, 'serializeRooms');
      roomManager.addRoom('test1');
      roomManager.rooms.get('test1')
        .addUser({ id: 1, client: 'Ura' });
      roomManager.addRoom('test2');
      roomManager.rooms.get('test2')
        .addUser({ id: 1, client: 'Ura' });
      roomManager.serializeRooms();
      spy.restore();
      roomManagerSpy.restore();
      sinon.assert.calledThrice(spy);
      sinon.assert.calledOnce(roomManagerSpy);
      expect(roomManagerSpy.returnValues[0]).to.be.an('array');
      expect(roomManagerSpy.returnValues[0].length).to.be.equal(size + 2);
    });
  });
});
