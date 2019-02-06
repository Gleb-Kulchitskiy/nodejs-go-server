const Room = require('../sockets/Room');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('Room', function () {
  let room;
  beforeEach(function () {
    room = new Room('test');
  });
  describe('room object', function () {
    it('should return an object instanceof Room with 3 field', function () {
      expect(room).to.be.an.instanceOf(Room);
      expect(room).to.be.an('object');
      expect(Object.keys(room).length).to.be.equal(3);
    });

    it('should return an object with field typeOf string', function () {
      expect(room.name).to.be.an('string');
    });

    it('should return an object with field instanceOf Map', function () {
      expect(room.members).to.be.an.instanceOf(Map);
    });

    it('should return an object with field instanceOf array', function () {
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

    it('should call emit method from all members', function () {
      const testProto = Object.assign({
        emit: () => {
        }
      });
      room.addUser(Object.assign(testProto, {
        id: 1,
        client: 'Ola',
        emit: () => {
        }
      }));
      room.addUser(Object.assign(testProto, {
        id: 2,
        client: 'OlaLa',
        emit: () => {
        }
      }));
      room.addUser(Object.assign(testProto, {
        id: 3,
        client: 'OlaLaLa',
        emit: () => {
        }
      }));
      const members = room.members;
      const member = room.members.get(1);
      const spyForEach = sinon.spy(members, 'forEach');
      const spyEmit = sinon.spy(member, 'emit');
      room.broadcastMessage('message');
      spyForEach.restore();
      sinon.assert.calledOnce(spyForEach);
      sinon.assert.calledThrice(spyEmit);
    });
  });

  describe('addEntry', function () {
    it('should called once and increase length of history field by 1', function () {
      const spy = sinon.spy(room, 'addEntry');
      room.addEntry('message');
      spy.restore();
      sinon.assert.calledOnce(spy);
      expect(spy.thisValues[0].history.length).be.equal(room.history.length);
    });
  });

  describe('getHistory', function () {
    it('should called once and return copy of history array', function () {
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
    it('should set value equal to the arguments', function () {
      const spy = sinon.spy(room, 'addUser');
      room.addUser({ id: 1, client: 'Olga' });
      spy.restore();
      expect(spy.thisValues[0].members.entries().next().value).to.be.deep.equal([1, { id: 1, client: 'Olga' }]);
    });
  });

  describe('removeUser', function () {
    it('should called once and decrease size of members by 1 if user exist', function () {
      room.addUser({ id: 1, client: 'Olga' });
      const spy = sinon.spy(room, 'removeUser');
      room.removeUser({ id: 1 });
      spy.restore();
      sinon.assert.calledOnce(spy);
      expect(spy.thisValues[0].members.size).to.be.equal(room.members.size);
    });
  });

  describe('serialize', function () {
    it('should called once and return an object with to field', function () {
      const spy = sinon.spy(room, 'serialize');
      room.serialize();
      spy.restore();
      sinon.assert.calledOnce(spy);
      expect(spy.returnValues[0]).to.be.an('object').that.has.all.keys('name', 'numMembers');
    });

    it('should return object where one field is represent name of room and a second number of its members', function () {
      const spy = sinon.spy(room, 'serialize');
      room.serialize();
      spy.restore();
      expect(spy.returnValues[0].name).to.be.equal(room.name);
      expect(spy.returnValues[0].numMembers).to.be.equal(room.members.size);
    });
  });
});
