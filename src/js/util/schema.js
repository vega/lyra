'use strict';
var vg = require('vega'),
    vgSchema;

/**
 * Return the Vega JSON schema, fetching it via XHR if it is not yet available
 * @returns {Object} The Vega JSON schema.
 */
module.exports = function() {
  return vgSchema || (vgSchema = vg.schema({
    url: 'http://vega.github.io/vega/vega-schema.json'
  }));
};
