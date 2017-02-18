'use strict';

const util = require('./index.js');
const constructSocket = require('../lib/retry.socket.js');

describe('Retry Socket', () => {

    it('Constructs a wrapped socket with a WS implementation', () => {
        const socket = constructSocket(util.mockNodeWebSocketConstructor);
        socket.should.have.a.property('wsImplementation').that.equals(util.mockNodeWebSocketConstructor);
    });

    it('Constructs a wrapped socket with a WS implementation and url', () => {
        const socket = constructSocket(util.mockNodeWebSocketConstructor, 'abc');
        socket.should.have.a.property('wsImplementation').that.equals(util.mockNodeWebSocketConstructor);
        socket.should.have.a.property('url').that.equals('abc');
    });

    it('Constructs a wrapped socket with a WS implementation, url and protocols', () => {
        const socket = constructSocket(util.mockNodeWebSocketConstructor, 'abc', 'someProtocol');
        socket.should.have.a.property('wsImplementation').that.equals(util.mockNodeWebSocketConstructor);
        socket.should.have.a.property('url').that.equals('abc');
        socket.should.have.a.property('protocols').that.equals('someProtocol');
    });

    it('Constructs a wrapped socket with a WS implementation, url, protocols and connection options', () => {
        const socket = constructSocket(util.mockNodeWebSocketConstructor, 'abc', 'someProtocol', 'connectionOptions');
        socket.should.have.a.property('wsImplementation').that.equals(util.mockNodeWebSocketConstructor);
        socket.should.have.a.property('url').that.equals('abc');
        socket.should.have.a.property('protocols').that.equals('someProtocol');
        socket.should.have.a.property('connectionOptions').that.equals('connectionOptions');
    });

    it('Can set a message queue', () => {
        const socket = constructSocket(util.mockNodeWebSocketConstructor);
        socket.setMessageQueue(42);
        socket.should.have.a.property('messageQueue').that.equals(42);
    });

    it('Can set a retryer', () => {
        const socket = constructSocket(util.mockNodeWebSocketConstructor);
        socket.setRetryer(42);
        socket.should.have.a.property('retryer').that.equals(42);
    });

    it('Can set up handlers for all the event types', () => {
        const socket = constructSocket(util.mockNodeWebSocketConstructor);
        socket.on('open', 1);
        socket.on('close', 2);
        socket.on('error', 3);
        socket.on('message', 4);
        socket.handlers.should.have.a.property('open').that.equals(1);
        socket.handlers.should.have.a.property('close').that.equals(2);
        socket.handlers.should.have.a.property('error').that.equals(3);
        socket.handlers.should.have.a.property('message').that.equals(4);
    });

    it('Can set up a message handler after being opened', () => {
        const socket = constructSocket(util.mockNodeWebSocketConstructor);
        socket.connect();
        return new Promise((resolve) => {
            socket.on('message', resolve);
            socket.instance.fire('message');
        });
    });

    it('Can set up a error handler after being opened', () => {
        const socket = constructSocket(util.mockNodeWebSocketConstructor);
        socket.connect();
        return new Promise((resolve) => {
            socket.on('error', resolve);
            socket.instance.fire('error');
        });
    });

    it('Fires the open handler', () => {
        const socket = constructSocket(util.mockNodeWebSocketConstructor);
        return new Promise((resolve) => {
            socket.successfullyConnected = resolve;
            socket.connect();
            socket.instance.fire('open');
        });
    });

    it('Fires the message handler', () => {
        const socket = constructSocket(util.mockNodeWebSocketConstructor);
        return new Promise((resolve) => {
            socket.on('message', resolve);
            socket.connect();
            socket.instance.fire('message');
        });
    });

    it('Fires the error handler', () => {
        const socket = constructSocket(util.mockNodeWebSocketConstructor);
        return new Promise((resolve) => {
            socket.on('error', resolve);
            socket.connect();
            socket.instance.fire('error');
        });
    });

    it('Fires the close handler', () => {
        const socket = constructSocket(util.mockNodeWebSocketConstructor);
        return new Promise((resolve) => {
            socket.reconnect = resolve;
            socket.connect();
            socket.instance.fire('close');
        });
    });

    it('Transfers existing handlers to a new websocket', () => {
        const socket = constructSocket(util.mockNodeWebSocketConstructor);
        return new Promise((resolve) => {
            socket.on('message', resolve);
            socket.connect();
            socket.connect();
            socket.instance.fire('message');
        });
    });

    context('successfullyConnected()', () => {

        it('Sets the connecting flag to false', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            socket.successfullyConnected();
            socket.should.have.a.property('connecting').that.equals(false);
        });

        it('Cancels the retryer', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            return new Promise((resolve) => {
                socket.setRetryer({
                    cancel: resolve
                });
                socket.successfullyConnected();
            });
        });

        it('Resets the retryer', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            return new Promise((resolve) => {
                socket.setRetryer({
                    cancel: () => {},
                    reset: resolve
                });
                socket.successfullyConnected();
            });
        });

        it('Flushes the message queue', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            return new Promise((resolve) => {
                socket.setMessageQueue({
                    flush: resolve
                });
                socket.successfullyConnected();
            });
        });

        it('Calls the open handler', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            return new Promise((resolve) => {
                socket.on('open', resolve);
                socket.successfullyConnected();
            });
        });
    });

    context('abort()', () => {

        it('Sets the connecting flag to false', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            socket.abort();
            socket.should.have.a.property('connecting').that.equals(false);
        });

        it('Purges the message queue', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            return new Promise((resolve) => {
                socket.setMessageQueue({
                    purge: resolve
                });
                socket.abort();
            });
        });

        it('Calls the close handler with a code and message', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            return new Promise((resolve) => {
                socket.on('close', (code, msg) => {
                    code.should.equal(42);
                    msg.should.equal('closed');
                    resolve();
                });
                socket.abort(42, 'closed');
            });
        });
    });

    context('reconnect()', () => {

        it('Calls abort if the socket is closed', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            socket.closed = true;
            return new Promise((resolve) => {
                socket.on('close', () => {
                    resolve();
                });
                socket.reconnect(42, 'closed');
            });
        });

        it('Calls abort if the close status code is 1000', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            return new Promise((resolve) => {
                socket.on('close', () => {
                    resolve();
                });
                socket.reconnect(1000, 'closed');
            });
        });

        it('Calls abort if there is no retryer', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            return new Promise((resolve) => {
                socket.on('close', () => {
                    resolve();
                });
                socket.reconnect(1006, 'abnormal close');
            });
        });

        it('Sets the connecting flag to true', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            socket.setRetryer({
                attempt: () => {}
            });
            socket.reconnect(1006, 'abnormal close');
            socket.should.have.a.property('connecting').that.equals(true);
        });

        it('Calls the retryer with connect as the first parameter', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            socket.setRetryer({
                attempt: (attempt) => {
                    attempt();
                }
            });

            return new Promise((resolve) => {
                socket.connect = resolve;
                socket.reconnect(1006, 'abnormal close');
            });
        });

        it('Calls the retryer with a bound abort as the second parameter', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            socket.setRetryer({
                attempt: (attempt, abort) => {
                    abort();
                }
            });

            return new Promise((resolve) => {
                socket.abort = (code, message) => {
                    code.should.equal(1006);
                    message.should.equal('abnormal close');
                    resolve();
                };
                socket.reconnect(1006, 'abnormal close');
            });
        });
    });

    context('connect()', () => {

        it('Set the connecting flag to true', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            socket.connect();
            socket.should.have.a.property('connecting').that.equals(true);
        });

        it('Constructs a new socket instance', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            socket.connect();
            socket.instance.should.be.an('object');
        });

        it('Attaches handlers to an event emitter websocket', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            socket.on('message', 42);
            socket.on('error', 142);
            socket.connect();

            socket.instance.handlers.message[0].should.equal(42);
            socket.instance.handlers.error[0].should.equal(142);
            socket.instance.handlers.open[0].should.equal(socket.successfullyConnected);
            socket.instance.handlers.close[0].should.equal(socket.reconnect);
        });

        it('Attaches handlers to an browser websocket', () => {
            const socket = constructSocket(util.mockBrowserConstructor);
            socket.on('message', 42);
            socket.on('error', 142);
            socket.connect();

            socket.instance.onmessage.should.equal(42);
            socket.instance.onerror.should.equal(142);
            socket.instance.onopen.should.equal(socket.successfullyConnected);
            socket.instance.onclose.should.equal(socket.reconnect);
        });

        it('Returns the socket instance', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            socket.connect().should.equal(socket);
        });
    });

    context('close()', () => {

        it('Sets the closed flag', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            socket.close();
            socket.should.have.a.property('closed').that.equals(true);
        });

        it('Cancels the attached retryer', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            return new Promise((resolve) => {
                socket.setRetryer({
                    cancel: resolve
                });
                socket.close();
            });
        });

        it('Purges the attaches message queue', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            return new Promise((resolve) => {
                socket.setMessageQueue({
                    purge: resolve
                });
                socket.close();
            });
        });

        it('Closes the underlying socket', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            socket.connect();
            socket.close(1000, 'normal close');
            socket.instance.should.have.a.property('closed').that.equals(true);
            socket.instance.should.have.a.property('closeCode').that.equals(1000);
            socket.instance.should.have.a.property('closeMessage').that.equals('normal close');
        });
    });

    context('send()', () => {

        it('Ignores messages while connecting when queueing is disabled', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            socket.connect();
            socket.send('some message');
            socket.instance.should.have.a.property('lastSentMessage').that.equals('');
            socket.instance.should.have.a.property('messagesSent').that.equals(0);
        });

        it('Queues messages while connecting when queueing is enabled', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            socket.connect();
            const messages = [];
            socket.setMessageQueue({
                push: (message) => {
                    messages.push(message);
                }
            });
            socket.send('some message');
            messages.length.should.equal(1);
            messages[0].should.equal('some message');
        });

        it('Sends a message when the socket is connected', () => {
            const socket = constructSocket(util.mockNodeWebSocketConstructor);
            socket.connect();
            socket.connecting = false;
            socket.send('some message');
            socket.instance.should.have.a.property('messagesSent').that.equals(1);
            socket.instance.should.have.a.property('lastSentMessage').that.equals('some message');
        });
    });
});
