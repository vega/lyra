'use strict';
var React = require('react'),
    ScaleList = require('./visualization/ScaleList'),
    LayerList = require('./visualization/LayerList'),
    model = require('../model');

var VisualSidebar = React.createClass({
  render: function() {
    var scales = model.scale();
    return (
      <div className="sidebar" id="visual-sidebar">
        <h2>Groups</h2>

        <LayerList ref="layerList"
          layers={model.Scene.marks} />

        <ScaleList ref="scaleList"
          scales={scales} />
      </div>
    );
  }
});

module.exports = VisualSidebar;
