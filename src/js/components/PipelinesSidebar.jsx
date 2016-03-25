'use strict';
var React = require('react'),
    PipelineList = require('./pipelines/PipelineList'),
    model = require('../model');

var Sidebars = React.createClass({
  getInitialState: function() {
    return {
      selected: model.Scene._id,
      expandedLayers: {}
    };
  },

  render: function() {
    var pipelines = model.pipeline();
    return (
      <div>
        <PipelineList pipelines={pipelines} />
      </div>
    );
  }
});

module.exports = Sidebars;
