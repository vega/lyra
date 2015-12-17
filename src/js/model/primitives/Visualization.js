var dl = require('datalib'),
    vg = require('vega'),
    sg = require('../signals'),
    Group = require('./marks/Group'),
    Pipeline = require('./data/Pipeline');

var SG_WIDTH = 'vis_width', SG_HEIGHT = 'vis_height';

function Visualization() {
  Group.call(this);

  this.width  = 500;
  this.height = 500;
  this.padding = 'auto';

  this._data = {};
  this.data  = [];

  return this;
}

var prototype = (Visualization.prototype = Object.create(Group.prototype));
prototype.constructor = Visualization;

prototype.init = function() {
  this.width  = sg.init(SG_WIDTH, this.width);
  this.height = sg.init(SG_HEIGHT, this.height);
  return Group.prototype.init.call(this);
};

prototype.export = function(resolve) {
  var spec = Group.prototype.export.call(this, resolve);

  spec.data = this.data.map(function(d) { return d.export(resolve); });

  // Always resolve width/height signals.
  spec.width  = spec.width.signal  ? sg.value(SG_WIDTH)  : spec.width;
  spec.height = spec.height.signal ? sg.value(SG_HEIGHT) : spec.height; 

  // Remove mark-specific properties
  delete spec.type;
  delete spec.from;
  delete spec.properties;
  return spec;
};

prototype.manipulators = function() { 
  return Group.prototype.manipulators.call(this).marks[0];
};

prototype.pipeline = function(id) {
  if (dl.isNumber(id)) return this._data[id];
  var p = dl.isString(id) ? new Pipeline(id) : id;
  this.data.push(p);
  return (this._data[p._id] = p);
};

module.exports = Visualization;