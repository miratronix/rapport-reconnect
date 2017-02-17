'use strict';

const util = require('./index.js');
const constructQueue = require('../lib/queue/index.js');

describe('Queue', () => {

    context('Factory', () => {

        it('Returns null when no options are specified', () => {
            const queue = constructQueue();
            util.should.equal(queue, null);
        });

        it('Returns null when `queueMessages` is not specified', () => {
            const queue = constructQueue({ type: 'interval' });
            util.should.equal(queue, null);
        });

        it('Returns a queue when `queueMessages` is set to true', () => {
            const queue = constructQueue({ queueMessages: true });
            queue.should.be.an('object');
        });

        it('Returns a queue when `queueMessages` is set to a queue name', () => {
            const queue = constructQueue({ queueMessages: 'simple' });
            queue.should.be.an('object');
        });

        it('Returns a queue when `queueMessages` is set to an empty object', () => {
            const queue = constructQueue({ queueMessages: {} });
            queue.should.be.an('object');
        });

        it('Returns a queue when `queueMessages` is set to an object with a `type`', () => {
            const queue = constructQueue({ queueMessages: { type: 'simple' } });
            queue.should.be.an('object');
        });

        it('Throws when `queueMessages` is set to an object with an incorrect `type`', () => {
            (() => {
                constructQueue({ queueMessages: { type: 'notARealQueueType' } });
            }).should.throw(TypeError, 'Invalid message queue type: notARealQueueType');
        });
    });

    context('Simple', () => {

        let queue;

        beforeEach(() => {
            queue = constructQueue({ queueMessages: { type: 'simple' } });
        });

        it('Is the default queue type', () => {
            const defaultQueue = constructQueue({ queueMessages: true });
            defaultQueue.should.have.a.property('messages').that.is.an('array');
        });

        it('Can push messages onto the queue', () => {
            queue.push('test1');
            queue.push('test2');
            queue.messages.should.have.a.property('length').that.equals(2);
        });

        it('Can flush messages out of the queue', () => {
            queue.push('test1');
            queue.push('test2');

            const flushed = [];
            queue.flush((msg) => {
                flushed.push(msg);
            });

            flushed.should.have.a.property('length').that.equals(2);
        });

        it('Can purge the queue', () => {
            queue.push('test1');
            queue.push('test2');
            queue.purge();
            queue.messages.should.have.a.property('length').that.equals(0);
        });
    });
});
