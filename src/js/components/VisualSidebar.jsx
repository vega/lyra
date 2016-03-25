'use strict';
var React = require('react'),
    ScaleList = require('./visualization/ScaleList'),
    LayerList = require('./visualization/LayerList'),
    model = require('../model');

var Sidebars = React.createClass({
  getInitialState: function() {
    return {
      selected: model.Scene._id,
      expandedLayers: {}
    };
  },

  render: function() {
    return (
      <div>
        <LayerList ref="layerList"
          layers={model.Scene.marks} />

        <ScaleList ref="scaleList"
          scales={model.scale()} />
      </div>
    );
  }
});

module.exports = Sidebars;
