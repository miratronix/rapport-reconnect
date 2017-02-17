'use strict';

const constructSimpleQueue = require('./simple.queue.js');

/**
 * @typedef {object} MessageQueue
 * @property {function} push
 * @property {function} purge
 * @property {function} flush
 */

/**
 * Constructs a message queue.
 *
 * @param {object} options The queue options.
 * @param {boolean|string|object} [options.queueMessages] The options for the message queue.
 * @return {MessageQueue|null} Null if queue is disabled, the queue otherwise.
 */
const constructQueue = (options) => {

    // Message queuing disabled, return null
    if (!options || !options.queueMessages) {
        return null;
    }

    let queueOptions = {};

    // Just a boolean supplied, go with a simple queue
    if (options.queueMessages === true) {
        queueOptions.type = 'simple';

    // Just a queue type supplied, use that with default settings
    } else if (typeof options.queueMessages === 'string') {
        queueOptions.type = options.queueMessages;

    // Full on object sent, copy it
    } else {
        queueOptions = options.queueMessages;
    }

    if (!queueOptions.type || queueOptions.type === 'simple') {
        return constructSimpleQueue();
    } else {
        throw new TypeError(`Invalid message queue type: ${queueOptions.type}`);
    }
};

module.exports = constructQueue;
