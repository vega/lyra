'use strict';
var React = require('react'),
    PipelineList = require('./pipelines/PipelineList'),
    model = require('../model');

var PipelineSidebar = React.createClass({
  render: function() {
    var pipelines = model.pipeline();
    return (
      <div className="sidebar" id="pipeline-sidebar">
        <h2>Data Pipelines</h2>

        <PipelineList pipelines={pipelines} />
      </div>
    );
  }
});

module.exports = PipelineSidebar;
