'use strict';
var inherits = require('inherits'),
    sg = require('../../signals'),
    Group = require('./Group');

var SG_WIDTH = 'vis_width',
    SG_HEIGHT = 'vis_height';

/**
 * @classdesc A Lyra Scene Primitive.
 * @description  This class corresponds to the root of a Vega specification.
 * @extends {Mark}
 *
 * @see  Vega's {@link https://github.com/vega/vega/wiki/Visualization|top-level
 * Visualization} documentation for more information on this class' "public"
 * properties.
 *
 * @constructor
 * @param {Object} [props] - An object defining this mark's properties
 * @param {string} [props.name] - The name of the mark
 * @param {number} [props._id] - A unique mark ID
 */
function Scene(props) {
  Group.call(this, props || Scene.defaultProperties());
}

inherits(Scene, Group);
// The scene is the top level of hierarchy
Scene.prototype.parent = null;

/**
 * Returns an object representing the default values for a scene mark,
 * containing a type string and a Vega mark properties object.
 *
 * @static
 * @returns {Object} The default mark properties
 */
Scene.defaultProperties = function() {
  // Note that scene has no "properties" property
  return {
    // Containers for child marks
    scales: [],
    legends: [],
    axes: [],
    marks: [],
    // type will be removed later on, but is used to generate an appropriate name
    type: 'group',
    // Scene has no Vega properties object, but we mock it for now to avoid
    // distrupting the export functionality
    properties: {
      update: {}
    },
    // Scene-specific visual properties
    width: 610,
    height: 610,
    padding: 'auto',
    background: 'white'
    // name: 'group' + '_' + counter.type('group'); // Assign name in the reducer
    // _id: assign ID in the reducer
  };
};

Scene.prototype.init = function() {
  sg.init(SG_WIDTH, this.width);
  sg.init(SG_HEIGHT, this.height);
  // Update internal properties to point at signal values
  this.width = sg.reference(SG_WIDTH);
  this.height = sg.reference(SG_HEIGHT);
  return Group.prototype.init.call(this);
};

Scene.prototype.export = function(resolve) {
  var spec = Group.prototype.export.call(this, resolve);

  // Always resolve width/height signals.
  spec.width = spec.width.signal ? sg.get(SG_WIDTH) : spec.width;
  spec.height = spec.height.signal ? sg.get(SG_HEIGHT) : spec.height;

  // Remove mark-specific properties
  delete spec.type;
  delete spec.from;
  delete spec.properties;

  return spec;
};

Scene.prototype.manipulators = function() {
  return Group.prototype.manipulators.call(this)[0];
};

module.exports = Scene;
