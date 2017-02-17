# rapport-reconnect [![CircleCI](https://circleci.com/gh/miratronix/rapport-reconnect.svg?style=shield)](https://circleci.com/gh/miratronix/rapport-reconnect) [![Coverage Status](https://coveralls.io/repos/github/miratronix/rapport-reconnect/badge.svg)](https://coveralls.io/github/miratronix/rapport-reconnect)
[![NPM](https://nodei.co/npm/rapport-reconnect.png)](https://npmjs.org/package/rapport-reconnect)

A simple plugin that adds reconnect functionality to the [Rapport](https://github.com/miratronix/rapport) library.

## Installation
Node: Install the plugin via NPM: `npm install --save rapport-reconnect`

Browser: Attach `rapport.reconnect.min.js` to your HTML page

Then add the plugin to rapport:
```javascript
// Globally
Rapport.use(require('rapport-reconnect')); // In Node.js
Rapport.use(RapportReconnect); // In the browser

// Or to a instance
Rapport(wsImplementation).use(require('rapport-reconnect')); // In Node.js
Rapport(wsImplementation).use(RapportReconnect); // In the browser
```

## Basic Usage
This plugin adds reconnect capabilities to a socket. The reconnect functionality is specified in the rapport options object:
```javascript
// Enable reconnect on all sockets created by the rapport library
Rapport.configure({ reconnect: true });

// Or all sockets created by a rapport instance:
const rapport = Rapport(wsImplementation, { reconnect: true }); // Or
const rapport = Rapport(wsImplementation).configure({ reconnect: true });

// Or a single socket
rapport.create('ws://hello.world', { reconnect: true });
```
*NOTE*: Only sockets that are created with `.create()` can have reconnect functionality. Specifying a reconnect value for a 
socket that is wrapped with `.wrap()` will do nothing.

## Reconnect Options
By default, reconnection will be attempted on an interval of 500 milliseconds, with no stop condition. All of the following 
calls are equivalent:
```javascript
rapport.create('url', { reconnect: true });
rapport.create('url', { reconnect: 'interval' });
rapport.create('url', { reconnect: { type: 'interval' } });
rapport.create('url', { reconnect: { type: 'interval', interval: 500 } });
rapport.create('url', { reconnect: { type: 'interval', interval: 500, maxAttempts: 0 } });
```
You can change the `maxAttempts` and `interval` as you see fit. When retrying fails (because the `maxAttempts` have been 
exceeded), the `onClose` handler will be called as normal.

More retry methods (fibonacci and exponential) will be implemented in future versions. If there is another reconnect 
method you would like to see, please open an issue describing it.

## Message Queueing
The reconnect plugin also supports message queueing. When enabled, messages that are sent during a reconnect will be pushed
onto a queue. When the connection is established, they will all be sent immediately. The following options all enable `simple` 
message queueing (and the default `interval` reconnect shown above):
```javascript
rapport.create('url', { reconnect: { queueMessages: true } });
rapport.create('url', { reconnect: { queueMessages: { type: 'simple' } } });
```
More queueing mechanisms can be implemented as needed, please open an issue with any requests.
