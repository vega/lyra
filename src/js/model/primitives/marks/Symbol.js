var dl = require('datalib'),
    sg = require('../../../model/signals'),
    Mark = require('./Mark'),
    manips = require('./manipulators'),
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

prototype.manipulators = manips([]);

module.exports = Symbol;