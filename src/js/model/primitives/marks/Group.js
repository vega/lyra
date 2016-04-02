/* eslint consistent-this:0, no-undefined:0*/
'use strict';
var dl = require('datalib'),
    inherits = require('inherits'),
    model = require('../../'),
    lookup = model.lookup,
    Mark = require('./Mark'),
    store = require('../../../store'),
    vegaInvalidate = require('../../../actions/vegaInvalidate'),
    primitiveActions = require('../../../actions/primitiveActions'),
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
  var PrimitiveCtor = CHILDREN[type[1] || primitiveType];
  var lookupChild = dl.isNumber(child) ? lookup(child) : child;

  if (!lookupChild && primitiveType === 'marks') {
    store.dispatch(primitiveActions.addMark(PrimitiveCtor.defaultProperties({
      _parent: this._id
    })));
    // return;
  }

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
    store.dispatch(vegaInvalidate(true));
    child.init();
    store.dispatch(vegaInvalidate(true));
  }

  var id = child._id;
  // Get reference to the group's marks, scales, legends, or axes collection
  var types = this[primitiveType];

  if (types.indexOf(id) < 0) {
    types.push(id);
  }
  return child.parent ? child.parent(this._id) : child;
};

/**
 * Remove a single child mark from this group
 * @param  {number|Object} [child] The ID or Primitive corresponding to the
 * child to be removed from the Group.
 * @returns {void}
 */
Group.prototype.removeChild = function(child) {
  var lookupChild = dl.isNumber(child) ? lookup(child) : child;
  if (lookupChild) {
    child = lookupChild;
  } else {
    return;
  }
  var id = child._id;
  var types = this.marks;
  var childIndex = types.indexOf(id);
  if (childIndex !== -1) {
    if (child.type === 'group') {
      for (var x = 0; x < child.marks.length; x++) {
        child.removeChild(child.marks[x]);
      }
    }
    child.remove();
    types.splice(childIndex, 1);
  }
};

/**
 * Remove all children and children's children from group
 * @param {string} type - Marks, scales, legends, axes
 * @returns {void}
 */
Group.prototype.removeChildren = function(type) {
  var types = this[type];
  if (type === 'marks') {
    this.marks.forEach(function(childId) {
      var child = lookup(childId);
      if (child.type === 'group') {
        for (var x = 0; x < child.marks.length; x++) {
          child.removeChild(child.marks[x]);
        }
      }
      child.remove();
    });
    this.marks = [];
  }
  store.dispatch(vegaInvalidate(true));
};

module.exports = Group;

