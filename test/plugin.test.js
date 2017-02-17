'use strict';

const Rapport = require('rapport');
const util = require('./index.js');
const plugin = require('../lib/index.js');

describe('Plugin', () => {

    let rapport;

    beforeEach(() => {
        rapport = Rapport(util.mockNodeWebSocketConstructor).use(plugin);
    });

    it('Wraps a standard Node websocket', () => {
        const testSocket = rapport.constructWebsocket('test', {});
        testSocket.should.have.a.property('wsImplementation').that.is.a('function');
        testSocket.should.have.a.property('retryer').that.equals(null);
        testSocket.should.have.a.property('messageQueue').that.equals(null);
    });

    it('Wraps a standard Browser websocket', () => {
        const testSocket = rapport.constructWebsocket('test', {});
        testSocket.should.have.a.property('wsImplementation').that.is.a('function');
        testSocket.should.have.a.property('retryer').that.equals(null);
        testSocket.should.have.a.property('messageQueue').that.equals(null);
    });

    it('Adds a retryer if specified', () => {
        const testSocket = rapport.constructWebsocket('test', { reconnect: true });
        testSocket.should.have.a.property('wsImplementation').that.is.a('function');
        testSocket.should.have.a.property('retryer').that.is.a('object');
        testSocket.should.have.a.property('messageQueue').that.equals(null);
    });

    it('Adds a retryer and message queue if specified', () => {
        const testSocket = rapport.constructWebsocket('test', { reconnect: { queueMessages: true } });
        testSocket.should.have.a.property('wsImplementation').that.is.a('function');
        testSocket.should.have.a.property('retryer').that.is.a('object');
        testSocket.should.have.a.property('messageQueue').that.is.a('object');
    });

    it('Adds itself to the window if it\'s present', () => {
        global.window = {};
        delete require.cache[require.resolve('../lib/index.js')];
        require('../lib/index.js');
        global.window.should.have.a.property('RapportReconnect').that.is.an('object');
        delete global.window;
    });
});
