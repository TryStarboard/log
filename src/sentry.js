'use strict';

const es = require('event-stream');
const raven = require('raven');
const {omit, merge} = require('ramda');
const {LEVELS} = require('./util');

/**
 * @param  {Object} opts
 * @param  {string} opts.dsn
 * @return {Object} opts.options
 */
function createDefinition(opts) {
  const client = new raven.Client(opts.dsn, opts.options);

  const stream = es.through(function (data) {
    if (data.err == null) {
      return;
    }

    const defaultTags = {
      env: data.env,
      name: data.name,
    };

    client.captureException(data.err, {
      tags: data.tags ? merge(defaultTags, data.tags) : defaultTags,
      level: LEVELS[data.level],
      extra: omit(['name', 'tags', 'env', 'level', 'err', 'v'], data),
    });
  });

  return {
    type: 'raw',
    stream,
  };
}

module.exports = {
  createDefinition,
};
