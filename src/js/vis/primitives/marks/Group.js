var vg = require('vega'),
    Mark = require('./Mark');

var CHILD_TYPES = ['scales', 'axes', 'legends', 'marks'],
    MARK_TYPES  = ['rect', 'symbol', 'arc', 'area', 'line', 'text'];

var CHILDREN = {
  rect: require('./Rect')
};

function Group() {
  Mark.call(this, 'group');

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

// Get or create a child element. 
prototype.child = function(type, name) {
  var markType = type === 'marks' && MARK_TYPES.indexOf(name) >= 0;

  if (name && !markType) { 
    child = this[type].filter(function(c) {
      return c.name === name;
    })[0];
  } else {
    child = new CHILDREN[markType ? name : type]();
    this[type].push(child.init());
  }

  return child;
};

module.exports = Group;