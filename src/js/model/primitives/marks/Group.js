/* eslint consistent-this:0, no-undefined:0*/
'use strict';
var dl = require('datalib'),
    inherits = require('inherits'),
    model = require('../../'),
    lookup = model.lookup,
    Mark = require('./Mark'),
    store = require('../../../store'),
    reparse = require('../../../actions/reparseModel'),
    ns = require('../../../util/ns');

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
    width: {signal: ns('vis_width')},
    height: {signal: ns('vis_height')},
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
  var primitiveType = type[0];
  var lookupChild = dl.isNumber(child) ? lookup(child) : child;
  if (lookupChild) {
    child = lookupChild;
  } else {
    child = new CHILDREN[type[1] || primitiveType]();
    // We've added a primitive, so re-parse the model to add it to vega
    // This is sort of objectionable: We need to tell vega that we're about to
    // need to re-parse, in order to suppress any attempts to write the about-
    // to-be-initialized signals to a view that does not yet know about this
    // new primitive. But we have to then call reparse again immediately after
    // those signals are in the store in order to render vega WITH the newly-
    // added signals. This should be cleaned up a bit when we handle mark
    // creation and initialization through the store.
    store.dispatch(reparse(true));
    child.init();
    store.dispatch(reparse(true));
  }

  var id = child._id;
  // Get reference to the group's marks, scales, legends, or axes collection
  var types = this[primitiveType];

  if (types.indexOf(id) < 0) {
    types.push(id);
  }
  return child.parent ? child.parent(this._id) : child;
};

module.exports = Group;
