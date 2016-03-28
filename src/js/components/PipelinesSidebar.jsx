'use strict';
var React = require('react'),
    PipelineList = require('./pipelines/PipelineList'),
    model = require('../model');

var PipelineSidebar = React.createClass({
  classNames: 'sidebar col5 push9 pipeline-grid-break dk-blue-bg',
  getInitialState: function() {
    return {
      selected: model.Scene._id,
      expandedLayers: {}
    };
  },

  render: function() {
    var pipelines = model.pipeline();
    return (
      <div className={this.classNames}>
        <header>
          <h2 className="header2">
            Data Pipelines
          </h2>
        </header>
        <PipelineList pipelines={pipelines} />
      </div>
    );
  }
});

module.exports = PipelineSidebar;
