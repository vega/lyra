var dl = require('datalib'),
  Mark = require('./Mark'),
  inherits = require('inherits');

/**
 * @classdesc A Lyra Line Mark Primitive.
 * @see  {@link https://github.com/vega/vega/wiki/Marks#line}
 * @extends {Mark}
 *
 * @constructor
 */
function Line() {
  // These properties are set by calling Mark
  // {
  //   "type": "line",
  //   "properties": {
  //     "update": {
  //       "x": {"scale": "x", "field": "date"},
  //       "y": {"scale": "y", "field": "indexed_price"},
  //       "stroke": {"scale": "color", "field": "symbol"},
  //       "strokeWidth": {"value": 2}
  //     }
  //   }
  // },

  Mark.call(this, 'line');

  var props = this.properties,
      update = props.update,
      defaults = {
        "x": {"scale": "x", "field": "date"},
        "y": {"scale": "y", "field": "indexed_price"},
        "stroke": {"scale": "color", "field": "symbol"},
        "strokeWidth": {"value": 2}
      };

  dl.extend(update, defaults);

  return this;
}

// inherit Mark class' prototype
inherits(Line, Mark);



module.exports = Line;
