var dl = require('datalib'),
    vg = require('vega'),
    model  = require('../../'),
    lookup = model.primitive,
    Mark = require('./Mark'),
    util = require('../../../util');

var CHILD_TYPES = ['scales', 'axes', 'legends', 'marks'],
    MARK_TYPES  = ['group', 'rect', 'symbol', 'arc', 'area', 'line', 'text'];

var CHILDREN = {
  group:  Group,
  rect:   require('./Rect'),
  symbol: require('./Symbol'),
  scales: require('../Scale'),
};

function Group() {
  Mark.call(this, 'group');

  this.scales  = [];
  this.legends = [];
  this.axes  = [];
  this.marks = [];

  // By default, make groups full width/height.
  this.properties.update = {
    x: {value: 0},
    y: {value: 0},
    width: {signal: util.ns('vis_width')},
    height: {signal: util.ns('vis_height')},
    fill: {value: 'transparent'}
  };

  return this;
}

var prototype = (Group.prototype = Object.create(Mark.prototype));
prototype.constructor = Group;

prototype.export = function(resolve) {
  var self = this,
      spec = Mark.prototype.export.call(this, resolve),
      fn = function(id) { return lookup(id).export(resolve); };

  CHILD_TYPES.forEach(function(c) { spec[c] = self[c].map(fn); });
  return spec;
};

prototype.manipulators = function() {
  var self  = this,
      spec  = Mark.prototype.manipulators.call(this),
      group = spec[0],
      map = function(id) { return lookup(id).manipulators(); },
      red = function(children, child) {
        return ((dl.isArray(child) ?
          children.push.apply(children, child) : children.push(child)),
        children);
      };

  CHILD_TYPES.forEach(function(c) { group[c] = self[c].map(map).reduce(red, []); });
  return spec;
};

// Insert or create a child element.
prototype.child = function(type, child) {
  type  = type.split('.');
  child = (child === undefined) ? new CHILDREN[type[1] || type[0]]().init() :
    dl.isNumber(child) ? lookup(child) : child;

  var id = child._id, types = this[type[0]];
  if (types.indexOf(id) < 0) types.push(id);
  return child.parent ? child.parent(this._id) : child;
};

module.exports = Group;
