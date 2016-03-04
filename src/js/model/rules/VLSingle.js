var inherits = require('inherits'),
    Primitive = require('../primitives/Primitive');

// Map from Vega to Vega-Lite
var TYPES = {
  rect: 'bar',
  symbol: 'point'
};

function VLSingle(type) {
  this.mark = TYPES[type];
  this.data = {};
  this.encoding = {};
  this.config = {};

  this._map = {
    data: {},
    scales: {},
    axes: {},
    legends: {}
  };
  return Primitive.call(this);
}

inherits(VLSingle, Primitive);

module.exports = VLSingle;
