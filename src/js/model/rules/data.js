'use strict';
/**
 * Pretty basic: as we walk through the vega output generated from vega lite,
 * we want to map things we see there to things we have in our lyra model.
 *
 * i.e. Build mappings between things in the vega output and things in the Lyra model.
 * @param  {[type]} parsed [description]
 * @param  {[type]} from   [description]
 * @return {[type]}        [description]
 */
module.exports = function(parsed, from) {
  var map = this._rule._map.data;
  // This is a super-simple map to map b/w names in the vega output
  // VL's data[0].name.source maps to something in lyra e.g.
  map.source = from.parent()._source._id;
};
