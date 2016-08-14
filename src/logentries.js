'use strict'

const es = require('event-stream')
const Logentries = require('le_node')
const {transformLogData} = require('./util')

/**
 * @param  {Object} opts
 * @param  {string} opts.token
 * @return {Object}
 */
function createDefinition(opts) {
  const definition = Logentries.bunyanStream({
    token: opts.token
  })

  const transformStream = es.map((data, cb) => {
    cb(null, transformLogData(data))
  })

  // Replace stream
  transformStream.pipe(definition.stream)
  definition.stream = transformStream

  return definition
}

module.exports = {
  createDefinition
}
