const expect = require('chai').expect;
const sinon = require('sinon');
const _ = require('lodash');

const clientManager = require('../core/clients/clientManager');

describe('clientManager', function () {
  let size;
  beforeEach(function () {
    clientManager.clients = new Map();
    size = clientManager.clients.size;
  });
  describe('clients field', function () {
    it('should be an object with one field instance of Map', function () {
      expect(clientManager.clients).to.be.an.instanceof(Map);
      expect(Object.keys(clientManager).length).to.be.equal(1);
    });
  });
  describe('addClient', function () {
    it('should add clients instance to clients Map by clients id', function () {
      const spy = sinon.spy(clientManager, 'addClient');
      clientManager.addClient({ id: 1, field: 'field' });
      spy.restore();
      sinon.assert.calledOnce(spy);
      expect(size).to.be.equal(clientManager.clients.size - 1);
      expect(clientManager.clients.get(1)).to.be.deep.equal({ id: 1, client: { id: 1, field: 'field' } });
    });
  });
  describe('registerClient', function () {
    it('should add clients instance to clients Map by clients id', function () {
      const spy = sinon.spy(clientManager, 'registerClient');
      clientManager.registerClient({ id: 1, field: 'field' }, { id: 1, user: 'user' });
      spy.restore();
      sinon.assert.calledOnce(spy);
      expect(size).to.be.equal(clientManager.clients.size - 1);
      expect(clientManager.clients.get(1)).to.be.deep.equal({
        client: { id: 1, field: 'field' },
        id: 1,
        user: { id: 1, user: 'user' }
      });
    });
    it('arguments should contain clients and user objects', function () {
      const spy = sinon.spy(clientManager, 'registerClient');
      clientManager.registerClient({ id: 1, field: 'field' }, { id: 1, user: 'user' });
      spy.restore();
      expect(spy.getCall(0).args[1]).to.be.deep.equal({ id: 1, user: 'user' });
      expect(spy.getCall(0).args[0]).to.be.deep.equal({ id: 1, field: 'field' });
      expect(clientManager.clients.get(1).user).to.be.deep.equal({ id: 1, user: 'user' });
    });
  });
  describe('removeClient', function () {
    it('should remove instance from clients map by clients id', function () {
      clientManager.registerClient({ id: 1, field: 'field' }, { id: 123, name: 'name' });
      size = clientManager.clients.size;
      const spy = sinon.spy(clientManager, 'removeClient');
      clientManager.removeClient({ id: 1 });
      spy.restore();
      expect(spy.withArgs({ id: 1 }).calledOnce).to.be.true;
      expect(clientManager.clients.get({ id: 1 })).to.be.undefined;
      expect(clientManager.clients.size).to.be.equal(size - 1);
    });
  });
  describe('getAvailableUsers', function () {
    it('should return array of all users names from clients Map', function () {
      clientManager.registerClient({ id: 1 }, { name: 'name' });
      clientManager.registerClient({ id: 2 }, { name: 'name1' });
      clientManager.registerClient({ id: 3 }, { name: 'name2' });
      clientManager.addClient({ id: 22 });
      const spy = sinon.spy(clientManager, 'getAvailableUsers');
      clientManager.getAvailableUsers();
      spy.restore();
      expect(spy.withArgs().calledOnce).to.be.true;
      expect(spy.returnValues).to.be.an.instanceOf(Array);
      expect(spy.returnValues[0].length).to.be.equal(3);
    });
  });
  describe('isUserAvailable', function () {
    it('should return true if user is available', function () {
      clientManager.registerClient({ id: 1 }, { name: 'name' });
      const spy = sinon.spy(clientManager, 'isUserAvailable');
      clientManager.isUserAvailable('name');
      spy.restore();
      expect(spy.withArgs('name').calledOnce).to.be.true;
      expect(spy.returnValues[0]).to.be.true;
    });
    it('should return false if user is not in the list', function () {
      const spy = sinon.spy(clientManager, 'isUserAvailable');
      clientManager.isUserAvailable('Ola');
      spy.restore();
      expect(spy.withArgs('Ola').calledOnce).to.be.true;
      expect(spy.returnValues[0]).to.be.false;
    });
  });
  describe('getUserByName', function () {
    it('should return user by name', function () {
      clientManager.registerClient({ id: 1 }, { name: 'name' });
      const spy = sinon.spy(clientManager, 'getUserByName');
      clientManager.getUserByName('name');
      spy.restore();
      expect(spy.withArgs('name').calledOnce).to.be.true;
      expect(spy.returnValues[0]).to.be.deep.equal({ client: { id: 1 }, id: 1, user: { name: 'name' } });
    });
    it('should return undefined if user is not exist', function () {
      const spy = sinon.spy(clientManager, 'getUserByName');
      clientManager.getUserByName('name');
      spy.restore();
      expect(spy.withArgs('name').calledOnce).to.be.true;
      expect(spy.returnValues[0]).to.be.undefined;
    });
  });
  describe('getUserByClientId', function () {
    it('should return user by clients id', function () {
      clientManager.registerClient({ id: 1 }, { name: 'name' });
      const spy = sinon.spy(clientManager, 'getUserByClientId');
      clientManager.getUserByClientId(1);
      spy.restore();
      expect(spy.withArgs(1).calledOnce).to.be.true;
      expect(spy.returnValues[0]).to.be.deep.equal({ name: 'name' });
    });
    it('should return undefined if user not exist', function () {
      const spy = sinon.spy(clientManager, 'getUserByClientId');
      clientManager.getUserByClientId(1);
      spy.restore();
      expect(spy.withArgs(1).calledOnce).to.be.true;
      expect(spy.returnValues[0]).to.be.undefined;
    });
  });
  describe('getClientById', function () {
    it('should return clients by clients id', function () {
      clientManager.registerClient({ id: 1 }, { name: 'name' });
      const spy = sinon.spy(clientManager, 'getClientById');
      clientManager.getClientById(1);
      spy.restore();
      expect(spy.withArgs(1).calledOnce).to.be.true;
      expect(spy.returnValues[0]).to.be.deep.equal({ client: { id: 1 }, id: 1, user: { name: 'name' } });
    });
    it('should return undefined if clients not exist', function () {
      const spy = sinon.spy(clientManager, 'getClientById');
      clientManager.getClientById(1);
      spy.restore();
      expect(spy.withArgs(1).calledOnce).to.be.true;
      expect(spy.returnValues[0]).to.be.undefined;
    });
  });
});