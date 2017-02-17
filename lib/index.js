'use strict';

const constructRetrySocket = require('./retry.socket.js');
const constructMessageQueue = require('./queue/index.js');
const constructRetryer = require('./retry/index.js');

/**
 * Defines the Rapport plugin.
 */
const RapportPlugin = {

    /**
     * Extends Rapport instances.
     *
     * @param {object} rapportInstance The Rapport instance.
     */
    extendRapportInstance: (rapportInstance) => {

        // Override websocket instantiation
        rapportInstance.constructWebsocket = (url, options) => {

            const socket = constructRetrySocket(rapportInstance.Websocket, url, options.protocols, options.connection);

            socket.setRetryer(constructRetryer(options.reconnect));
            socket.setMessageQueue(constructMessageQueue(options.reconnect));

            return socket.connect();
        };
    }
};

if (typeof window !== 'undefined') {
    window.RapportReconnect = RapportPlugin;
}

if (typeof module !== 'undefined') {
    module.exports = RapportPlugin;
}
