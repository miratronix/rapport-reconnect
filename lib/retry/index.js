'use strict';

const constructIntervalRetryer = require('./interval.retry.js');

/**
 * @typedef {object} Retryer
 * @property {function} attempt
 * @property {function} reset
 * @property {function} cancel
 */

/**
 * Constructs a retryer.
 *
 * @param {boolean|string|object} options Options for the reconnect plugin.
 * @return {Retryer|null} Null if reconnect is disabled, a retryer object otherwise.
 */
const constructRetryer = (options) => {

    // Retry disabled, return null
    if (!options) {
        return null;
    }

    let retryOptions = {};

    // Just a boolean supplied, go with an interval
    if (options === true) {
        retryOptions.type = 'interval';

    // Just a retry type supplied, go with that type
    } else if (typeof options === 'string') {
        retryOptions.type = options;

    // Full on settings object, copy it
    } else {
        retryOptions = options;
    }

    if (!options.type || options.type === 'interval') {
        return constructIntervalRetryer(retryOptions);
    } else {
        throw new TypeError(`Invalid reconnect type: ${retryOptions.type}`);
    }
};

module.exports = constructRetryer;
