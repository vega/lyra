var dl = require('datalib'),
    sg = require('../../../model/signals'),
    Mark = require('./Mark'),
    util = require('../../../util');

var DELTA  = sg.DELTA,
    DX = DELTA+'.x', 
    DY = DELTA+'.y';

function Symbol(type) {
  Mark.call(this, 'symbol');
  return this;
}

var prototype = (Symbol.prototype = Object.create(Mark.prototype));
prototype.constructor = Symbol;

module.exports = Symbol;