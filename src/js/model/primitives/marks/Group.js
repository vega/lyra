/* eslint consistent-this:0, no-undefined:0*/
'use strict';
var dl = require('datalib'),
    inherits = require('inherits'),
    model = require('../../'),
    lookup = model.lookup,
    Mark = require('./Mark'),
    ns = require('../../../util/ns');

var CHILD_TYPES = ['scales', 'axes', 'legends', 'marks'];
// var MARK_TYPES = ['group', 'rect', 'symbol', 'arc', 'area', 'line', 'text'];
var CHILDREN = {
  // group: Group, // Assigned below
  rect: require('./Rect'),
  symbol: require('./Symbol'),
  text: require('./Text'),
  scales: require('../Scale'),
  legends: require('../Guide'),
  axes: require('../Guide'),
  line: require('./Line'),
  area: require('./Area')
};

/**
 * @classdesc A Lyra Group Mark Primitive.
 * @extends {Mark}
 * @see  Vega's {@link https://github.com/vega/vega/wiki/Group-Marks|Group Marks}
 * documentation for more information on this class' "public" properties.
 *
 * @constructor
 * @param {Object} [props] - An object defining this mark's properties
 * @param {string} props.type - The type of mark (should be 'group')
 * @param {Object} props.properties - A Vega mark properties object
 * @param {string} [props.name] - The name of the mark
 * @param {number} [props._id] - A unique mark ID
 */
function Group(props) {
  Mark.call(this, props || Group.defaultProperties());
}

CHILDREN.group = Group;

inherits(Group, Mark);

/**
 * Returns an object representing the default values for a group mark,
 * containing a type string and a Vega mark properties object.
 *
 * @static
 * @param {Object} [props] - Props to merge into the returned default properties object
 * @returns {Object} The default mark properties
 */
Group.defaultProperties = function(props) {
  return dl.extend({
    type: 'group',
    // name: 'group' + '_' + counter.type('group'); // Assign name in the reducer
    // _id: assign ID in the reducer
    properties: Mark.mergeProperties(Mark.defaultProperties(), {
      update: {
        x: {value: 0},
        y: {value: 0},
        width: {signal: ns('vis_width')},
        height: {signal: ns('vis_height')},
        fill: {value: 'transparent'}
      }
    }),
    // Containers for child marks
    scales: [],
    legends: [],
    axes: [],
    marks: []
  }, props);
};

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

module.exports = Group;

