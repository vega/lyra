'use strict';
var React = require('react'),
    PipelineList = require('./pipelines/PipelineList'),
    ScaleList = require('./ScaleList'),
    LayerList = require('./LayerList'),
    Inspector = require('./Inspector'),
    model = require('../model');

var Sidebars = React.createClass({
  getInitialState: function() {
    window.sidebar = this;
    return {
      selected: model.Scene._id,
      expandedLayers: {}
    };
  },

  render: function() {
    var pipelines = model.pipeline();

    return (
      <div>
        <ScaleList ref="scaleList"
          scales={model.scale()} />

        <LayerList ref="layerList"
          layers={model.Scene.marks} />

        <Inspector ref="inspector"
          pipelines={pipelines} />

        <PipelineList pipelines={pipelines} />
      </div>
    );
  }
});

module.exports = Sidebars;
