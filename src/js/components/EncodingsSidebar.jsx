'use strict';
var React = require('react'),
    ScaleList = require('./encodings/ScaleList'),
    LayerList = require('./encodings/LayerList');

var VisualSidebar = React.createClass({
  render: function() {
    return (
      <div className="sidebar" id="visual-sidebar">
        <LayerList ref="layerList" />
        <ScaleList ref="scaleList"/>
      </div>
    );
  }
});

module.exports = VisualSidebar;
