'use strict';

const util = require('./index.js');
const constructRetryer = require('../lib/retry/index.js');

describe('Retryer', () => {

    context('Factory', () => {

        it('Returns null when no options are specified', () => {
            const retryer = constructRetryer();
            util.should.equal(retryer, null);
        });

        it('Returns a retryer when constructed with `true`', () => {
            const retryer = constructRetryer(true);
            retryer.should.be.an('object');
        });

        it('Returns a retryer when constructed with a retryer name', () => {
            const retryer = constructRetryer('interval');
            retryer.should.be.an('object');
        });

        it('Returns a retryer when constructed with a empty object', () => {
            const retryer = constructRetryer({});
            retryer.should.be.an('object');
        });

        it('Returns a retryer when constructed with a type', () => {
            const retryer = constructRetryer({ type: 'interval' });
            retryer.should.be.an('object');
        });

        it('Throws when `retryerMessages` is set to an object with an incorrect `type`', () => {
            (() => {
                constructRetryer({ type: 'notARealRetryerType' });
            }).should.throw(TypeError, 'Invalid reconnect type: notARealRetryerType');
        });
    });

    context('Interval', () => {

        it('Is the default retryer type', () => {
            const retryer = constructRetryer(true);
            retryer.should.have.a.property('maxAttempts');
            retryer.should.have.a.property('interval');
            retryer.should.have.a.property('timeout');
            retryer.should.have.a.property('attempts');
        });

        it('Defaults to maxAttempts = 0', () => {
            const retryer = constructRetryer(true);
            retryer.maxAttempts.should.equal(0);
        });

        it('Defaults to interval = 500ms', () => {
            const retryer = constructRetryer(true);
            retryer.interval.should.equal(500);
        });

        it('Can set the maxAttempts from options', () => {
            const retryer = constructRetryer({ maxAttempts: 3 });
            retryer.maxAttempts.should.equal(3);
        });

        it('Can set the interval from options', () => {
            const retryer = constructRetryer({ interval: 100 });
            retryer.interval.should.equal(100);
        });

        it('Calls the first parameter in attempt to retry an operation', () => {
            const retryer = constructRetryer({ interval: 100 });
            return new Promise((resolve, reject) => {
                retryer.attempt(resolve, reject);
            });
        });

        it('Calls the second parameter in attempt to abort an operation', () => {
            const retryer = constructRetryer({ interval: 100, maxAttempts: 1 });
            return new Promise((resolve, reject) => {
                const tryAgain = () => {
                    retryer.attempt(reject, resolve);
                };
                retryer.attempt(tryAgain, reject);
            });
        });

        it('Can reset the attempts count', () => {
            const retryer = constructRetryer({ interval: 100, maxAttempts: 1 });
            retryer.attempts = 42;
            retryer.reset();
            retryer.attempts.should.equal(0);
        });

        it('Can cancel an active retry attempt', () => {
            const retryer = constructRetryer({ interval: 5 });
            retryer.attempt(() => {}, () => {});
            retryer.cancel();
            util.should.equal(retryer.timeout, null);
        });
    });
});
