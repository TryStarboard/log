'use strict';

const bunyan = require('bunyan');
const {identity, merge} = require('ramda');
const createLogentriesDefinition = require('./logentries').createDefinition;
const createSentryDefinition = require('./sentry').createDefinition;

/**
 * @param  {Object} opts
 * @param  {Object} opts.name
 * @param  {Object} opts.env
 * @param  {Object} opts.logentriesToken Required in production
 * @param  {Object} opts.sentryDsn       Required in production
 * @param  {Object} opts.sentryOptions   Required in production
 * @return {Object}
 */
function createLogger(opts) {
  const _opts = {
    name: opts.env,
    env: opts.env,
    serializers: merge(bunyan.stdSerializers, {
      // Don't serialize error here, Sentry needs the original error object
      err: identity
    }),
  };

  if (opts.env !== 'production') {
    _opts.streams = [require('./pretty')];
  } else {
    _opts.streams = [
      {
        stream: process.stdout
      },
      createSentryDefinition({
        dsn: opts.sentryDsn,
        options: opts.sentryOptions,
      }),
      createLogentriesDefinition({
        token: opts.logentriesToken
      })
    ];
  }

  return bunyan.createLogger(_opts);
}

function createFactory(opts) {
  return function () {
    return createLogger(opts);
  };
}

module.exports = {
  createFactory,
};
