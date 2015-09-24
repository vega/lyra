var vg = require('vega'),
    Group = require('./primitives/marks/Group');

function Visualization() {
  Group.call(this);

  this.width  = 500;
  this.height = 500;
  this.padding = 'auto';
}

var prototype = (Visualization.prototype = Object.create(Group.prototype));
prototype.constructor = Visualization;

prototype.export = function() {
  var spec = Group.prototype.export.call(this);

  // Remove mark-specific properties
  delete spec.type;
  delete spec.from;
  delete spec.properties;
  return spec;
};

prototype.manipulators = function() { 
  return Group.prototype.manipulators.call(this).marks[0];
};

module.exports = Visualization;