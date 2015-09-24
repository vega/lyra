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
}

var prototype = (Group.prototype = Object.create(Mark.prototype));
prototype.constructor = Group;

function childExport(x) { return x.export(); }
function childManips(x) { return x.manipulators(); }

prototype.export = function() {
  var self = this, 
      spec = Mark.prototype.export.call(this);
  CHILD_TYPES.forEach(function(c) {
    spec[c] = self[c].map(childExport);
  });
  return spec;
};

prototype.manipulators = function() {
  var self  = this,
      spec  = Mark.prototype.manipulators.call(this),
      group = spec.marks[0];
  CHILD_TYPES.forEach(function(c) {
    group[c] = self[c].map(childManips);
  });
  return spec;
};

// Get or create a child element. 
prototype.child = function(type) {
  var mark = arguments[1],
      name = MARK_TYPES.indexOf(mark) >= 0 ? arguments[2] : mark,
      child;

  if (name) { 
    child = this[type].filter(function(c) {
      return c.name === name;
    })[0];
  } else {
    child = new CHILDREN[mark || type]();
    this[type].push(child);
  }

  return child;
};

module.exports = Group;