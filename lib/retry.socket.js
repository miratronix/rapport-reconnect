'use strict';

// Pull in the standardize from the rapport peer dependency
const standardizeSocket = require('rapport/lib/standardize.js');

/**
 * @typedef {object} RetrySocket
 * @property {function} setRetryer
 * @property {function} setMessageQueue
 * @property {function} connect
 * @property {function} on
 * @property {function} close
 * @property {function} send
 */

/**
 * Constructs the retry socket.
 *
 * @param {function} wsImplementation The websocket implementation to use.
 * @param {string} url The string URL to connect to.
 * @param {string|string[]} [protocols] String or array of string sub protocols.
 * @param {*} [connectionOptions] Additional options to add to the socket.
 * @return {RetrySocket} The retry socket.
 */
const constructRetrySocket = (wsImplementation, url, protocols, connectionOptions) => {
    const retrySocket = {

        wsImplementation,
        url,
        protocols,
        connectionOptions,
        instance: null,
        handlers: {
            open: () => {},
            message: () => {},
            error: () => {},
            close: () => {}
        },

        retryer: null,
        messageQueue: null,
        connecting: false,
        closed: false,

        /**
         * Sets the retryer for the socket.
         *
         * @param {Retryer} retryer The retryer.
         */
        setRetryer: (retryer) => {
            retrySocket.retryer = retryer;
        },

        /**
         * Sets ht message queue for the socket.
         *
         * @param {MessageQueue} messageQueue The message queue.
         */
        setMessageQueue: (messageQueue) => {
            retrySocket.messageQueue = messageQueue;
        },

        /**
         * Called on open of the socket. Resets the retryer and flushes any queued messages.
         */
        successfullyConnected: () => {
            retrySocket.connecting = false;

            if (retrySocket.retryer) {
                retrySocket.retryer.cancel();
                retrySocket.retryer.reset();
            }

            if (retrySocket.messageQueue) {
                retrySocket.messageQueue.flush(retrySocket.send);
            }

            // Call on open handlers
            retrySocket.handlers.open();
        },

        /**
         * Aborts the socket reconnects. Called by a retryer when maximum limits are exceeded.
         *
         * @param {number} closeCode The close code.
         * @param {string} closeMsg The close message.
         */
        abort: (closeCode, closeMsg) => {
            retrySocket.connecting = false;

            if (retrySocket.messageQueue) {
                retrySocket.messageQueue.purge();
            }

            retrySocket.handlers.close(closeCode, closeMsg);
        },

        /**
         * Called on close of the socket, Calls the retryer to re-open the socket if applicable.
         *
         * @param {number} closeCode The close code.
         * @param {string} closeMsg The close message.
         */
        reconnect: (closeCode, closeMsg) => {

            // We were closed on our end, closed with a normal 1000 status code, or have no retry defined, give up
            if (retrySocket.closed || closeCode === 1000 || !retrySocket.retryer) {
                retrySocket.abort(closeCode, closeMsg);
                return;
            }

            retrySocket.connecting = true;
            retrySocket.retryer.attempt(retrySocket.connect, retrySocket.abort.bind(retrySocket, closeCode, closeMsg));
        },

        /**
         * Creates a new websocket and connects it.
         *
         * @return {RetrySocket} This retry socket, for simplicity.
         */
        connect: () => {
            retrySocket.connecting = true;
            retrySocket.instance = standardizeSocket(new retrySocket.wsImplementation(retrySocket.url, retrySocket.protocols, retrySocket.connectionOptions));

            retrySocket.instance.onOpen(retrySocket.successfullyConnected);
            retrySocket.instance.onClose(retrySocket.reconnect);
            retrySocket.instance.onMessage((msg) => {
                retrySocket.handlers.message(msg);
            });
            retrySocket.instance.onError((err) => {
                retrySocket.handlers.error(err);
            });

            return retrySocket;
        },

        /**
         * Override the sockets removeAllListeners function that is called by Rapport. We don't need it because we're
         * already enforcing one listener per type.
         */
        removeAllListeners: () => {},

        /**
         * Registers events to the socket.
         *
         * @param {string} event The event, should be 'open', 'message', 'error' or 'close'.
         * @param {function} handler The handler for the event.
         */
        on: (event, handler) => {
            retrySocket.handlers[event] = handler;
        },

        /**
         * Sends a message on the socket, queueing it up if we're in the middle of connecting.
         *
         * @param {string} msg The message to send.
         */
        send: (msg) => {

            // If we're in the middle of connecting, don't send the message
            if (retrySocket.connecting) {

                // If queuing is enabled, queue it instead
                if (retrySocket.messageQueue) {
                    retrySocket.messageQueue.push(msg);
                }

            } else {
                retrySocket.instance.send(msg);
            }
        },

        /**
         * Closes the socket.
         *
         * @param {number} code The close code.
         * @param {string} msg The close message.
         */
        close: (code, msg) => {
            retrySocket.closed = true;

            // Cancel any existing retries
            if (retrySocket.retryer) {
                retrySocket.retryer.cancel();
            }

            // Purge the message queue
            if (retrySocket.messageQueue) {
                retrySocket.messageQueue.purge();
            }

            // Close the underlying socket
            try {
                retrySocket.instance.close(code, msg);
            } catch (err) {
                // Socket is already closed
            }
        }
    };

    return retrySocket;
};

module.exports = constructRetrySocket;
