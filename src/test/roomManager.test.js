const expect = require('chai').expect;
const sinon = require('sinon');
const _ = require('lodash');

const roomManager = require('../sockets/RoomManager');
const Room = require('../sockets/Room');

describe('roomManager', function () {
  let manager;
  beforeEach(function () {
    manager = _.cloneDeep(roomManager);
    Object.setPrototypeOf(manager, roomManager);
  });
  describe('roomManager fields', function () {
    it('should be one property called "rooms"', function () {
      expect(Object.keys(manager).length).to.be.equal(1);
      expect(manager).to.have.own.property('rooms');
    });

    it('should be an object instanceOf Map', function () {
      expect(manager[Object.keys(manager)[0]]).to.be.an.instanceOf(Map);
    });
  });
  describe('addRoom', function () {
    it('should increase rooms object size by 1', function () {
      const roomsSize = manager.rooms.size;
      const spy = sinon.spy(manager, 'addRoom');
      manager.addRoom('test');
      sinon.assert.calledOnce(spy);
      //   spy.restore();
      expect(manager.rooms.size).to.be.equal(roomsSize + 1);
    });
    it('added value should be instance of Room', function () {
      const spy = sinon.spy(manager, 'addRoom');
      manager.addRoom('test');
      sinon.assert.calledOnce(spy);
      spy.restore();
      expect(manager.rooms.get('test')).to.be.an.instanceOf(Room);
    });
    it('new key of added value should be equal argument', function () {
      const spy = sinon.spy(manager, 'addRoom');
      manager.addRoom('test');
      sinon.assert.calledOnce(spy);
      spy.restore();
      expect(manager.rooms.get('test')).to.be.an('object');
    });
  });
  describe('removeRoom', function () {
    it('should remove Room object from rooms by name', function () {
      manager.addRoom('test');
      const roomsSize = manager.rooms.size;
      const spy = sinon.spy(manager, 'removeRoom');
      manager.removeRoom('test');
      spy.restore();
      sinon.assert.calledOnce(spy);
      sinon.assert.calledWith(spy, 'test');
      expect(manager.rooms.size).to.be.equal(roomsSize - 1);
      expect(manager.rooms.get('test')).to.be.undefined;
    });
  });
  describe('removeClient', function () {
    it('should call removeUser on every room', function () {
      const spy = sinon.spy(Room.prototype, 'removeUser');
      manager.addRoom('test1');
      manager.rooms.get('test1')
        .addUser({ id: 1, client: 'Ura' });
      manager.addRoom('test2');
      manager.rooms.get('test2')
        .addUser({ id: 1, client: 'Ura' });
      manager.removeClient({ id: 1 });
      spy.restore();
      sinon.assert.calledThrice(spy);
      expect(manager.rooms.get('test1').members.get('1')).to.be.undefined;
    });
  });
  describe('getRoomByName', function () {
    it('should return room by name', function () {
      const spy = sinon.spy(manager, 'getRoomByName');
      manager.getRoomByName('global');
      spy.restore();
      sinon.assert.calledWith(spy, 'global');
      expect(spy.getCall(0).args[0]).to.be.equal('global');
      expect(spy.returnValues[0].name).to.be.equal('global');
      expect(spy.returnValues[0]).to.be.an('object');
    });
  });
  describe('serializeRooms', function () {
    it('should call serialize at all rooms', function () {
      const size = manager.serializeRooms().length;
      const spy = sinon.spy(Room.prototype, 'serialize');
      const managerSpy = sinon.spy(manager, 'serializeRooms');
      manager.addRoom('test1');
      manager.rooms.get('test1')
        .addUser({ id: 1, client: 'Ura' });
      manager.addRoom('test2');
      manager.rooms.get('test2')
        .addUser({ id: 1, client: 'Ura' });
      manager.serializeRooms();
      spy.restore();
      managerSpy.restore();
      sinon.assert.calledThrice(spy);
      sinon.assert.calledOnce(managerSpy);
      expect(managerSpy.returnValues[0]).to.be.an('array');
      expect(managerSpy.returnValues[0].length).to.be.equal(size + 2);
    });
  });
});
