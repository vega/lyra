/* eslint consistent-this:0, no-undefined:0*/
'use strict';
var dl = require('datalib'),
    inherits = require('inherits'),
    model = require('../../'),
    lookup = model.primitive,
    Mark = require('./Mark'),
    util = require('../../../util');

var CHILD_TYPES = ['scales', 'axes', 'legends', 'marks'];
// MARK_TYPES = ['group', 'rect', 'symbol', 'arc', 'area', 'line', 'text'];

/**
 * @classdesc A Lyra Group Mark Primitive.
 * @extends {Mark}
 * @see  Vega's {@link https://github.com/vega/vega/wiki/Group-Marks|Group Marks}
 * documentation for more information on this class' "public" properties.
 *
 * @constructor
 */
function Group() {
  Mark.call(this, 'group');

  this.scales = [];
  this.legends = [];
  this.axes = [];
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


var CHILDREN = {
  group: Group,
  rect: require('./Rect'),
  symbol: require('./Symbol'),
  text: require('./Text'),
  scales: require('../Scale'),
  legends: require('../Guide'),
  axes: require('../Guide'),
  line: require('./Line'),
  area: require('./Area')
};


inherits(Group, Mark);

Group.prototype.export = function(resolve) {
  var self = this,
      spec = Mark.prototype.export.call(this, resolve),
      fn = function(id) {
        return lookup(id).export(resolve);
      };

  CHILD_TYPES.forEach(function(c) {
    spec[c] = self[c].map(fn);
  });
  return spec;
};

Group.prototype.manipulators = function() {
  var self = this,
      spec = Mark.prototype.manipulators.call(this),
      group = spec[0],
      map = function(id) {
        return lookup(id).manipulators();
      },
      red = function(children, child) {
        return ((dl.isArray(child) ?
          children.push.apply(children, child) : children.push(child)),
        children);
      };

  CHILD_TYPES.forEach(function(c) {
    group[c] = self[c].map(map).reduce(red, []);
  });
  return spec;
};

/**
 * Insert or create a child Primitive.
 * @param  {string} type - The type of the child (`scales`, `axes`, `legends`).
 * For marks, this should also include the mark type (e.g., `marks.rect`).
 * @param  {number|Object} [child] - The ID or Primitive corresponding to the
 * child to be inserted into the Group. If no child is specified, a new one
 * is created and initialized.
 * @returns {Object} The child Primitive.
 */
Group.prototype.child = function(type, child) {
  type = type.split('.');
  var lookupChild = dl.isNumber(child) ? lookup(child) : child;
  child = (child === undefined) ? new CHILDREN[type[1] || type[0]]().init() : lookupChild;

  var id = child._id, types = this[type[0]];
  if (types.indexOf(id) < 0) {
    types.push(id);
  }
  return child.parent ? child.parent(this._id) : child;
};

module.exports = Group;
