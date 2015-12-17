var dl = require('datalib'),
    vg = require('vega'),
    Mark = require('./Mark');

var CHILD_TYPES = ['scales', 'axes', 'legends', 'marks'],
    MARK_TYPES  = ['rect', 'symbol', 'arc', 'area', 'line', 'text'];

var CHILDREN = {
  rect: require('./Rect')
};

function Group() {
  Mark.call(this, 'group');

  // For fast lookups.
  this._scales  = {};
  this._legends = {};
  this._axes  = {};
  this._marks = {};

  // For ordered specs.
  this.scales  = [];
  this.legends = [];
  this.axes  = [];
  this.marks = [];

  return this;
}

var prototype = (Group.prototype = Object.create(Mark.prototype));
prototype.constructor = Group;

prototype.export = function(resolve) {
  var self = this, 
      spec = Mark.prototype.export.call(this, resolve),
      fn = function(x) { return x.export(resolve); };

  CHILD_TYPES.forEach(function(c) { spec[c] = self[c].map(fn); });
  return spec;
};

prototype.manipulators = function() {
  var self  = this,
      spec  = Mark.prototype.manipulators.call(this),
      group = spec.marks[0],
      fn = function(x) { return x.manipulators(); };

  CHILD_TYPES.forEach(function(c) { group[c] = self[c].map(fn); });
  return spec;
};

// Get, insert or create a child element. 
prototype.child = function(type, child) {
  var mark = type === 'marks',
      ctor = arguments[mark ? 2 : 1] === undefined,
      lookup = '_'+type;

  if (dl.isNumber(child)) {
    return this[lookup][child];
  } else if (ctor) {
    child = new CHILDREN[mark ? child : type]().init();
  }

  this[type].push(child);
  return (this[lookup][child._id] = child);
};

module.exports = Group;