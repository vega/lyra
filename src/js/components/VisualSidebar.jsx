'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    ScaleList = require('./visualization/ScaleList'),
    LayerList = require('./visualization/LayerList'),
    model = require('../model');

var VisualSidebar = React.createClass({
  render: function() {
    var scales = model.scale();
    return (
      <div className="sidebar" id="visual-sidebar">
        <LayerList ref="layerList" />

        <ScaleList ref="scaleList" scales={scales} />
      </div>
    );
  }
});

module.exports = VisualSidebar;
