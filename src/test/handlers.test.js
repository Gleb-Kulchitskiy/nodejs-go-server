const sinon = require('sinon');
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const _ = require('lodash');
const util = require('util');

const clientManager = require('../sockets/ClientManager');
const roomManager = require('../sockets/RoomManager');
const Room = require('../sockets/Room');
const handlers = require('../sockets/handlers').handlers({ id: 1 }, clientManager, roomManager);
