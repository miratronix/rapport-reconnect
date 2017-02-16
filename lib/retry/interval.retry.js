'use strict';

/**
 * Constructs a interval based retryer.
 *
 * @param {object} options The options for the retryer.
 * @param {number} [options.maxAttempts=0] The number of attempts to make before giving up.
 * @param {number} [options.interval=500] The number of milliseconds to wait between attempts.
 * @return {Retryer} The interval based retryer.
 */
const constructIntervalRetryer = (options) => {
    const retryer = {

        attempts: 0,
        maxAttempts: options.maxAttempts || 0,
        interval: options.interval || 500,
        timeout: null,

        /**
         * Does an attempt on the socket.
         *
         * @param {function} connect The connect function to call to make an attempt.
         * @param {function} abort The abort function to call when retrying has exceeded maximum limits.
         */
        attempt: (connect, abort) => {
            if (retryer.maxAttempts && retryer.attempts >= retryer.maxAttempts) {
                abort();
                return;
            }

            retryer.attempts++;
            retryer.timeout = setTimeout(connect, retryer.interval);
        },

        /**
         * Resets the retryer.
         */
        reset: () => {
            retryer.attempts = 0;
        },

        /**
         * Cancels any outstanding retrys.
         */
        cancel: () => {
            if (retryer.timeout) {
                clearTimeout(retryer.timeout);
            }
        }
    };

    return retryer;
};

module.exports = constructIntervalRetryer;
