'use strict';

/**
 * Constructs a simple queue.
 *
 * @return {MessageQueue} The queue object.
 */
const constructSimpleQueue = () => {
    const queue = {

        messages: [],

        /**
         * Adds a message to the queue.
         *
         * @param {string} message The message to queue.
         */
        push: (message) => {
            queue.messages.push(message);
        },

        /**
         * Purges the queue of entries.
         */
        purge: () => {
            queue.messages = [];
        },

        /**
         * Flushes all entries in the queue with the supplied function.
         *
         * @param send
         */
        flush: (send) => {
            while (queue.messages.length > 0) {
                send(queue.messages.shift());
            }
        }
    };

    return queue;
};

module.exports = constructSimpleQueue;
