const expect = require('chai').expect;
const sinon = require('sinon');

const Room = require('../sockets/Room');

describe('Room class', function () {
  let room;
  beforeEach(function () {
    room = new Room('test');
  });
  describe('room object', function () {
    it('should be an object instanceof Room with 3 field', function () {
      expect(room).to.be.an.instanceOf(Room);
      expect(room).to.be.an('object');
      expect(Object.keys(room).length).to.be.equal(3);
    });

    it('should have a field typeOf string', function () {
      expect(room.name).to.be.an('string');
    });

    it('should have a field instanceOf Map', function () {
      expect(room.members).to.be.an.instanceOf(Map);
    });

    it('should have a field instanceOf array', function () {
      expect(room.history).to.be.an.instanceOf(Array);
    });
  });

  describe('broadcastMessage', function () {
    it('should throw an error if members array field is empty', function () {
      expect(() => room.broadcastMessage('test')).to.throw(Error, 'No members to broadcast');
    });

    it('should throw an error if no message provided in function call', function () {
      room.addUser({ id: '1', client: 'igor' });
      expect(() => room.broadcastMessage()).to.throw(Error, 'No message to broadcast');
    });

    it('should throw Error if message not a string', () => {
      room.addUser({ id: '1', client: 'igor' });
      const message = { notString: 1 };
      expect(() => room.broadcastMessage(message)).to.throw(Error, `Message should be a string, but got ${message.toString()}`);
    });

    it('should call emit method from all members', function () {
      const testProto = {
        emit: () => {
        }
      };
      room.addUser(Object.setPrototypeOf({
        id: 1,
        client: 'Ola'
      }, testProto));
      room.addUser(Object.setPrototypeOf({
        id: 2,
        client: 'OlaLa'
      }, testProto));
      room.addUser(Object.setPrototypeOf({
        id: 3,
        client: 'OlaLaLa'
      }, testProto));
      const spyForEach = sinon.spy(room.members, 'forEach');
      // eslint-disable-next-line no-proto
      const memberProto = room.members.get(1).__proto__;
      const spyEmit = sinon.spy(memberProto, 'emit');
      room.broadcastMessage('message');
      spyForEach.restore();
      sinon.assert.calledOnce(spyForEach);
      sinon.assert.calledThrice(spyEmit);
    });
  });

  describe('addEntry', function () {
    it('should be called once and push argument to the history', function () {
      const size = room.history.length;
      const spy = sinon.spy(room, 'addEntry');
      room.addEntry('message');
      spy.restore();
      sinon.assert.calledOnce(spy);
      expect(spy.thisValues[0].history.length).be.equal(size + 1);
    });
  });

  describe('getHistory', function () {
    it('should be called once and return copy of history', function () {
      const spy = sinon.spy(room, 'getHistory');
      room.addEntry({ id: 1, client: 'Roma' });
      room.getHistory();
      spy.restore();
      sinon.assert.calledOnce(spy);
      expect(spy.returnValues[0]).to.deep.equal(room.history);
      expect(spy.returnValues[0]).to.be.an('array');
    });
  });

  describe('addUser', function () {
    it('should called once, increase size of members by 1', function () {
      const spy = sinon.spy(room, 'addUser');
      room.addUser({ id: 1, client: 'Roma' });
      spy.restore();
      sinon.assert.calledOnce(spy);
      expect(spy.thisValues[0].members.size).to.be.equal(room.members.size);
    });
    it('should set the value equal to the arguments', function () {
      const spy = sinon.spy(room, 'addUser');
      room.addUser({ id: 1, client: 'Olga' });
      spy.restore();
      expect(spy.thisValues[0].members.entries().next().value).to.be.deep.equal([1, { id: 1, client: 'Olga' }]);
    });
  });

  describe('removeUser', function () {
    it('should remove user and decrease size of members by 1 if user exist', function () {
      const membersSize = room.members.size;
      room.addUser({ id: 1, client: 'Olga' });
      const spy = sinon.spy(room, 'removeUser');
      room.removeUser({ id: 1 });
      spy.restore();
      sinon.assert.calledOnce(spy);
      expect(spy.thisValues[0].members.size).to.be.equal(membersSize);
    });
    it('should remove user by id', function () {
      room.addUser({ id: 1, client: 'Ola' });
      const roomMock = sinon.mock(room);

      roomMock
        .expects('removeUser')
        .withArgs({ id: 1 });
      room.removeUser({ id: 1 });
      roomMock.verify();
      roomMock.restore();
    });
  });

  describe('serialize', function () {
    it('should be called once and return an object with 2 fields', function () {
      const spy = sinon.spy(room, 'serialize');
      room.serialize();
      spy.restore();
      sinon.assert.calledOnce(spy);
      expect(spy.returnValues[0]).to.be.an('object').that.has.all.keys('name', 'numMembers');
    });

    it('should return object where one field is represent name of room and the second number of its members', function () {
      const spy = sinon.spy(room, 'serialize');
      room.serialize();
      spy.restore();
      expect(spy.returnValues[0].name).to.be.equal(room.name);
      expect(spy.returnValues[0].numMembers).to.be.equal(room.members.size);
    });
  });
});
