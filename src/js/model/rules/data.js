'use strict';

var getParent = require('../../util/hierarchy').getParent;

/**
 * Parse the data source definitions in the resultant Vega specification.
 * For now, as we do not yet support transforms, we only add an entry to the
 * rule's `map` to identify the data source named "source" as our backing Lyra
 * Dataset primitive.
 *
 * @namespace  rules.data
 * @memberOf rules
 * @param  {Object} parsed An object containing the parsed rule and output Vega spec.
 * @param  {Dataset} from  The Lyra Dataset primitive that backs the current mark.
 * @returns {void}
 */
function data(parsed, from) {
  // TODO: multiple datasets per pipeline
  var map = this._rule._map.data;
  // This is a super-simple map to map b/w names in the vega output
  // VL's data[0].name.source maps to something in lyra e.g.
  map.source = from._id;
}

module.exports = data;
