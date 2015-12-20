var Primitive = require('../primitives/Primitive');

// Map from Vega to Vega-Lite 
var TYPES = {
  rect: 'bar',
  symbol: 'point'
};

function VLSingle(type) {
  this.type = TYPES[type];
  this.encoding = {};
  this._map = {
    data: {},
    scales: {},
    axes: {},
    legends: {}
  };
  return Primitive.call(this);
}

var prototype = (VLSingle.prototype = Object.create(Primitive.prototype));
prototype.constructor = VLSingle;

module.exports = VLSingle;