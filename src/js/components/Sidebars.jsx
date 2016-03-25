'use strict';
var React = require('react'),
    InspectorSidebar = require('./InspectorSidebar'),
    VisualSidebar = require('./VisualSidebar'),
    PipelinesSidebar = require('./PipelinesSidebar'),
    model = require('../model');

// Splitting each sidebar into it's column
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
        <VisualSidebar/>
        <InspectorSidebar ref="inspector"
          pipelines={pipelines} />
        <PipelinesSidebar/>
      </div>
    );
  }
});

module.exports = Sidebars;
